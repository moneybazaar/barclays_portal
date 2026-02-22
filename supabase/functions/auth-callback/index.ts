import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://secure.barclays-ib.app",
  "https://application.barclays-ib.app",
  "https://registration.barclays-ib.com",
  "https://barclayportal.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return new Response(
        JSON.stringify({ error: "Missing code or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authPortalUrl = Deno.env.get("AUTH_PORTAL_URL");
    const authPortalApiKey = Deno.env.get("AUTH_PORTAL_API_KEY");

    if (!authPortalUrl || !authPortalApiKey) {
      console.error("Missing AUTH_PORTAL_URL or AUTH_PORTAL_API_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify code with auth portal
    const verifyResponse = await fetch(`${authPortalUrl}/api/verify-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": authPortalApiKey,
      },
      body: JSON.stringify({ code, email }),
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error("Auth portal verification failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.valid) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert user in app_users table
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .upsert(
        {
          email: email,
          external_user_id: verifyData.user_data?.id || email,
          name: verifyData.user_data?.name || null,
          auth_source: "external_auth",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (!userError && userData) {
      // Ensure user has a role in app_user_roles (default to client)
      await supabase
        .from("app_user_roles")
        .upsert(
          { user_id: userData.id, role: verifyData.user_data?.role || "client" },
          { onConflict: "user_id,role" }
        );
    }

    if (userError) {
      console.error("Error upserting user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to create user session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create session
    const { error: sessionError } = await supabase
      .from("app_sessions")
      .insert({
        user_id: userData.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Session created for user: ${userData.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        session_token: sessionToken,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});

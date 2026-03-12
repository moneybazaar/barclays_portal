import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_token } = await req.json();

    if (!session_token) {
      return new Response(JSON.stringify({ valid: false, error: "No token" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate session
    const { data: session, error } = await supabase
      .from("app_sessions")
      .select("*, app_users(*)")
      .eq("token", session_token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = session.app_users as any;

    // Get role from app_user_roles
    const { data: roleData } = await supabase
      .from("app_user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = roleData?.role || "client";

    return new Response(JSON.stringify({
      valid: true,
      user: { id: user.id, email: user.email, name: user.name },
      role,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("validate-session error:", err);
    return new Response(JSON.stringify({ valid: false, error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

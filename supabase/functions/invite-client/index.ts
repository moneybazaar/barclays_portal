import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_token, email, name } = await req.json();

    if (!session_token || !email) {
      return new Response(
        JSON.stringify({ error: "session_token and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate admin session
    const { data: session } = await supabase
      .from("app_sessions")
      .select("user_id, expires_at")
      .eq("token", session_token)
      .single();

    if (!session || new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("app_user_roles")
      .select("role")
      .eq("user_id", session.user_id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate salt
    const salt = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const code = crypto.randomUUID().substring(0, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Insert invitation
    const { error: inviteError } = await supabase
      .from("pending_invitations")
      .insert({
        code,
        salt,
        user_email: email,
        user_name: name || null,
        invited_by: session.user_id,
        expires_at: expiresAt,
        status: "pending",
      });

    if (inviteError) {
      console.error("Insert invitation error:", inviteError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build invite link
    const appDomain = Deno.env.get("APP_DOMAIN") || "https://iportal.barclays-ib.app";
    const inviteLink = `${appDomain}/apply/${salt}`;

    // Send email via send-email function
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #00395d; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Barclays Investment Bank</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #00395d; margin-top: 0;">You've Been Invited</h2>
          <p style="color: #333; line-height: 1.6;">Dear ${name || "Client"},</p>
          <p style="color: #333; line-height: 1.6;">You have been invited to open an account with Barclays Investment Bank. Please click the link below to complete your application.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background: #00aeef; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 4px; font-weight: bold; display: inline-block;">Complete Application</a>
          </div>
          <p style="color: #666; font-size: 13px;">This invitation expires in 7 days. If you did not expect this invitation, please disregard this email.</p>
          <p style="color: #666; font-size: 13px;">Reference: ${code}</p>
        </div>
        <div style="background: #f5f5f5; padding: 20px 30px; text-align: center; font-size: 11px; color: #999;">
          <p>Barclays Investment Bank · Confidential</p>
        </div>
      </div>
    `;

    try {
      await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          subject: "You've Been Invited — Barclays IB Portal",
          html: emailHtml,
        },
      });
    } catch (emailErr) {
      console.error("Email send error (non-fatal):", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, invite_code: code, invite_link: inviteLink, salt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("invite-client error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

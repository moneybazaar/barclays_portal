import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      salt,
      name,
      email,
      phone,
      nationality,
      date_of_birth,
      address,
      employment_status,
      income_range,
      source_of_funds,
      tax_id,
      pep_status,
      password,
    } = await req.json();

    if (!salt || !email || !name || !password) {
      return new Response(
        JSON.stringify({ error: "salt, email, name, and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate invitation
    const { data: invite, error: inviteErr } = await supabase
      .from("pending_invitations")
      .select("*")
      .eq("salt", salt)
      .single();

    if (inviteErr || !invite) {
      return new Response(
        JSON.stringify({ error: "Invalid invitation link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invite.status === "used" || invite.used_at) {
      return new Response(
        JSON.stringify({ error: "This invitation has already been used" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This invitation has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("app_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "An account with this email already exists" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const { data: newUser, error: userError } = await supabase
      .from("app_users")
      .insert({
        email,
        name,
        phone: phone || null,
        address: address || null,
        company: nationality || null, // using company field to store nationality for now
        password_hash: passwordHash,
        auth_source: "invite",
        kyc_status: "pending",
      })
      .select()
      .single();

    if (userError) {
      console.error("Create user error:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to create account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign client role
    await supabase.from("app_user_roles").insert({
      user_id: newUser.id,
      role: "client",
    });

    // Mark invitation as used
    await supabase
      .from("pending_invitations")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("salt", salt);

    console.log(`Client registered: ${email} (user_id: ${newUser.id})`);

    return new Response(
      JSON.stringify({ success: true, message: "Account created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("register-client error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = (Deno.env.get("EMAIL_PROVIDER") || "").toLowerCase();

    if (provider === "resend") {
      const apiKey = Deno.env.get("RESEND_API_KEY");
      if (!apiKey) throw new Error("RESEND_API_KEY not configured");

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from || "Barclays IB Portal <noreply@barclays-ib.app>",
          to: [to],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resend API error");

      return new Response(
        JSON.stringify({ success: true, messageId: data.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (provider === "smtp") {
      // SMTP not yet implemented — placeholder for future nodemailer-based sender
      return new Response(
        JSON.stringify({ error: "SMTP provider not yet implemented" }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No provider configured — log and return success (dry-run mode)
    console.log(`[send-email][dry-run] To: ${to}, Subject: ${subject}`);
    return new Response(
      JSON.stringify({ success: true, messageId: "dry-run", note: "EMAIL_PROVIDER not configured — email logged but not sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

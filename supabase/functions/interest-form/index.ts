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
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key for server-to-server communication
    const apiKey = req.headers.get("X-API-Key");
    const expectedApiKey = Deno.env.get("AUTH_PORTAL_API_KEY");

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error("Unauthorized: Invalid API key");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const body = await req.json();
      const {
        email,
        name,
        phone,
        interest_type, // 'bonds', 'application', 'general'
        investment_amount,
        message,
        source_domain,
        metadata,
      } = body;

      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert interest submission
      const { data, error } = await supabase
        .from("interest_submissions")
        .insert({
          email,
          name: name || null,
          phone: phone || null,
          interest_type: interest_type || "general",
          investment_amount: investment_amount || null,
          message: message || null,
          source_domain: source_domain || origin || "unknown",
          metadata: metadata || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting interest submission:", error);
        return new Response(
          JSON.stringify({ error: "Failed to submit interest form" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Interest submission created: ${data.id} from ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          submission_id: data.id,
          message: "Thank you for your interest. We will be in touch shortly.",
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      // Get submissions (for admin use)
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      let query = supabase
        .from("interest_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching submissions:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch submissions" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ submissions: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Interest form error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(null), "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function validateSession(supabase: any, token: string) {
  const { data: session, error } = await supabase
    .from("app_sessions")
    .select("*, app_users(*)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !session) return null;

  const user = session.app_users as any;

  // Get role
  const { data: roleData } = await supabase
    .from("app_user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return { user, role: roleData?.role || "client" };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { session_token, action, holding, holding_id, user_id } = body;

    if (!session_token) {
      return new Response(JSON.stringify({ error: "No session token" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const auth = await validateSession(supabase, session_token);
    if (!auth) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { user, role } = auth;
    const isAdmin = role === "admin";

    switch (action || "list") {
      case "list": {
        let query = supabase.from("holdings").select("*").order("created_at", { ascending: false });
        if (!isAdmin) {
          query = query.eq("user_id", user.id);
        } else if (user_id) {
          query = query.eq("user_id", user_id);
        }
        const { data, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ holdings: data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "add": {
        const insertData = { ...holding, user_id: isAdmin && holding.user_id ? holding.user_id : user.id };
        const { data, error } = await supabase.from("holdings").insert(insertData).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ holding: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "update": {
        let query = supabase.from("holdings").update(holding).eq("id", holding_id);
        if (!isAdmin) query = query.eq("user_id", user.id);
        const { data, error } = await query.select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ holding: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "delete": {
        let query = supabase.from("holdings").delete().eq("id", holding_id);
        if (!isAdmin) query = query.eq("user_id", user.id);
        const { error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (err) {
    console.error("manage-holdings error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

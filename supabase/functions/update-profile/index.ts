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
  return session.app_users as any;
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
    const { session_token, action } = body;

    if (!session_token) {
      return new Response(JSON.stringify({ error: "No session token" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await validateSession(supabase, session_token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case "update": {
        const { name, phone, company, address, theme_preference } = body;
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (company !== undefined) updates.company = company;
        if (address !== undefined) updates.address = address;
        if (theme_preference !== undefined) updates.theme_preference = theme_preference;

        const { data, error } = await supabase
          .from("app_users")
          .update(updates)
          .eq("id", user.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ user: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "list-sessions": {
        const { data, error } = await supabase
          .from("app_sessions")
          .select("id, created_at, expires_at, token")
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ sessions: data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "revoke-session": {
        const { session_id } = body;
        if (!session_id) {
          return new Response(JSON.stringify({ error: "session_id required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { error } = await supabase
          .from("app_sessions")
          .delete()
          .eq("id", session_id)
          .eq("user_id", user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "get-profile": {
        const { data, error } = await supabase
          .from("app_users")
          .select("id, email, name, phone, company, address, theme_preference")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ user: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (err) {
    console.error("update-profile error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

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
    const { session_token, action } = body;

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

    switch (action) {
      case "list": {
        let query = supabase.from("deposits").select("*").order("created_at", { ascending: false });
        if (!isAdmin) {
          query = query.eq("user_id", user.id);
        } else if (body.user_id) {
          query = query.eq("user_id", body.user_id);
        }
        const { data, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ deposits: data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "create": {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin only" }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { user_id: targetId, amount, currency } = body;
        if (!targetId || !amount) {
          return new Response(JSON.stringify({ error: "user_id and amount required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const referenceCode = `DEP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const { data, error } = await supabase
          .from("deposits")
          .insert({
            user_id: targetId,
            amount,
            currency: currency || "USD",
            reference_code: referenceCode,
            status: "pending",
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ deposit: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "update-status": {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin only" }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { deposit_id, status } = body;
        if (!deposit_id || !status) {
          return new Response(JSON.stringify({ error: "deposit_id and status required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const updates: any = { status };
        if (status === "received") updates.received_at = new Date().toISOString();

        const { data, error } = await supabase
          .from("deposits")
          .update(updates)
          .eq("id", deposit_id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ deposit: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "delete": {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin only" }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { deposit_id } = body;
        const { error } = await supabase.from("deposits").delete().eq("id", deposit_id);
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
    console.error("manage-deposits error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

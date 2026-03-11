import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validateAdmin(supabase: any, token: string) {
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

  if (roleData?.role !== "admin") return null;

  return { user, role: roleData.role };
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

    const auth = await validateAdmin(supabase, session_token);
    if (!auth) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case "list-clients": {
        // Get all app_users
        const { data: users, error: usersErr } = await supabase
          .from("app_users")
          .select("id, email, name, created_at")
          .order("created_at", { ascending: false });

        if (usersErr) throw usersErr;

        // Get all roles
        const { data: roles } = await supabase
          .from("app_user_roles")
          .select("user_id, role");

        // Get holdings stats per user
        const { data: holdings } = await supabase
          .from("holdings")
          .select("user_id, shares, units, principal, current_price");

        const clients = (users || []).map((u: any) => {
          const userRole = roles?.find((r: any) => r.user_id === u.id);
          const userHoldings = (holdings || []).filter((h: any) => h.user_id === u.id);
          const totalValue = userHoldings.reduce((sum: number, h: any) => {
            const qty = Number(h.shares || h.units || h.principal || 0);
            return sum + qty * Number(h.current_price);
          }, 0);

          return {
            id: u.id,
            email: u.email,
            name: u.name,
            role: userRole?.role || "client",
            created_at: u.created_at,
            holdingsCount: userHoldings.length,
            totalValue,
          };
        });

        return new Response(JSON.stringify({ clients }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "update-role": {
        const { user_id, role } = body;
        if (!user_id || !role) {
          return new Response(JSON.stringify({ error: "user_id and role required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (role === "none") {
          // Remove role
          await supabase
            .from("app_user_roles")
            .delete()
            .eq("user_id", user_id);
        } else {
          // Upsert role
          const { data: existing } = await supabase
            .from("app_user_roles")
            .select("id")
            .eq("user_id", user_id)
            .single();

          if (existing) {
            await supabase
              .from("app_user_roles")
              .update({ role })
              .eq("user_id", user_id);
          } else {
            await supabase
              .from("app_user_roles")
              .insert({ user_id, role });
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "get-stats": {
        const { count: clientCount } = await supabase
          .from("app_users")
          .select("*", { count: "exact", head: true });

        const { data: allHoldings } = await supabase
          .from("holdings")
          .select("shares, units, principal, current_price");

        const totalAum = (allHoldings || []).reduce((sum: number, h: any) => {
          const qty = Number(h.shares || h.units || h.principal || 0);
          return sum + qty * Number(h.current_price);
        }, 0);

        const holdingsCount = allHoldings?.length || 0;

        return new Response(JSON.stringify({
          totalClients: clientCount || 0,
          totalAum,
          totalPositions: holdingsCount,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (err) {
    console.error("admin-clients error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

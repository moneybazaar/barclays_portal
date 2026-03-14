import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    // Research listing is available to all authenticated users
    if (action === "list-research") {
      const auth = await validateSession(supabase, session_token);
      if (!auth) {
        return new Response(JSON.stringify({ error: "Invalid session" }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data, error } = await supabase
        .from("research_posts")
        .select("*")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ posts: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // All other actions require admin
    const auth = await validateAdmin(supabase, session_token);
    if (!auth) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case "list-clients": {
        const { data: users, error: usersErr } = await supabase
          .from("app_users")
          .select("id, email, name, phone, company, created_at")
          .order("created_at", { ascending: false });

        if (usersErr) throw usersErr;

        const { data: roles } = await supabase
          .from("app_user_roles")
          .select("user_id, role");

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
            phone: u.phone,
            company: u.company,
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
          await supabase.from("app_user_roles").delete().eq("user_id", user_id);
        } else {
          const { data: existing } = await supabase
            .from("app_user_roles").select("id").eq("user_id", user_id).single();
          if (existing) {
            await supabase.from("app_user_roles").update({ role }).eq("user_id", user_id);
          } else {
            await supabase.from("app_user_roles").insert({ user_id, role });
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "get-stats": {
        const { count: clientCount } = await supabase
          .from("app_users").select("*", { count: "exact", head: true });

        const { data: allHoldings } = await supabase
          .from("holdings").select("shares, units, principal, current_price");

        const totalAum = (allHoldings || []).reduce((sum: number, h: any) => {
          const qty = Number(h.shares || h.units || h.principal || 0);
          return sum + qty * Number(h.current_price);
        }, 0);

        return new Response(JSON.stringify({
          totalClients: clientCount || 0,
          totalAum,
          totalPositions: allHoldings?.length || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "create-client": {
        const { email, name, password, role: clientRole } = body;
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "email and password required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Hash password (SHA-256 for compatibility with existing login)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        const { data: newUser, error: createError } = await supabase
          .from("app_users")
          .insert({ email, name: name || null, password_hash: passwordHash, auth_source: "internal" })
          .select()
          .single();

        if (createError) throw createError;

        if (clientRole) {
          await supabase.from("app_user_roles").insert({ user_id: newUser.id, role: clientRole });
        }

        return new Response(JSON.stringify({ user: newUser }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "update-client": {
        const { user_id, name, email, phone, company, address } = body;
        if (!user_id) {
          return new Response(JSON.stringify({ error: "user_id required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (company !== undefined) updates.company = company;
        if (address !== undefined) updates.address = address;

        const { data: updated, error } = await supabase
          .from("app_users").update(updates).eq("id", user_id).select().single();

        if (error) throw error;
        return new Response(JSON.stringify({ user: updated }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "reset-password": {
        const { user_id, new_password } = body;
        if (!user_id || !new_password) {
          return new Response(JSON.stringify({ error: "user_id and new_password required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(new_password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        await supabase.from("app_users").update({ password_hash: passwordHash }).eq("id", user_id);
        await supabase.from("app_sessions").delete().eq("user_id", user_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "create-research": {
        const { title, summary, content, author } = body;
        if (!title) {
          return new Response(JSON.stringify({ error: "title required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data, error } = await supabase
          .from("research_posts")
          .insert({ title, summary, content, author, published_at: new Date().toISOString() })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ post: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "delete-research": {
        const { post_id } = body;
        const { error } = await supabase.from("research_posts").delete().eq("id", post_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "add-note": {
        const { user_id, note } = body;
        if (!user_id || !note) {
          return new Response(JSON.stringify({ error: "user_id and note required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { data, error } = await supabase
          .from("client_notes")
          .insert({ user_id, note, created_by: auth.user.id })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ note: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "list-notes": {
        const { user_id } = body;
        const { data, error } = await supabase
          .from("client_notes")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ notes: data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "delete-note": {
        const { note_id } = body;
        const { error } = await supabase.from("client_notes").delete().eq("id", note_id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "update-kyc-status": {
        const { user_id, kyc_status, notes: kycNotes } = body;
        if (!user_id || !kyc_status) {
          return new Response(JSON.stringify({ error: "user_id and kyc_status required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const validStatuses = ["pending", "submitted", "approved", "rejected"];
        if (!validStatuses.includes(kyc_status)) {
          return new Response(JSON.stringify({ error: `kyc_status must be one of: ${validStatuses.join(", ")}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const kycUpdate: any = {
          kyc_status,
          kyc_reviewed_at: new Date().toISOString(),
          kyc_reviewed_by: auth.user.id,
        };

        const { error: kycErr } = await supabase.from("app_users").update(kycUpdate).eq("id", user_id);
        if (kycErr) throw kycErr;

        // Optionally add a note
        if (kycNotes) {
          await supabase.from("client_notes").insert({
            user_id,
            note: `KYC ${kyc_status}: ${kycNotes}`,
            created_by: auth.user.id,
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "list-kyc-clients": {
        const { data: users, error: usersErr } = await supabase
          .from("app_users")
          .select("id, email, name, kyc_status, kyc_reviewed_at")
          .order("created_at", { ascending: false });
        if (usersErr) throw usersErr;

        const kycTypes = ["kyc_id", "kyc_address_proof", "kyc_selfie", "aml_source_of_funds", "aml_declaration"];
        const { data: kycDocs } = await supabase
          .from("documents")
          .select("id, user_id, title, doc_type, created_at, file_path")
          .in("doc_type", kycTypes)
          .order("created_at", { ascending: false });

        const kycClients = (users || []).map((u: any) => ({
          ...u,
          kyc_documents: (kycDocs || []).filter((d: any) => d.user_id === u.id),
        }));

        return new Response(JSON.stringify({ clients: kycClients }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "list-invitations": {
        const { data: invites, error: invErr } = await supabase
          .from("pending_invitations")
          .select("*")
          .order("created_at", { ascending: false });

        if (invErr) throw invErr;
        return new Response(JSON.stringify({ invitations: invites || [] }), {
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

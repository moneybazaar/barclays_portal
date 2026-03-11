import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        const targetUserId = isAdmin && body.user_id ? body.user_id : user.id;
        let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (!isAdmin) {
          query = query.eq("user_id", user.id);
        } else if (body.user_id) {
          query = query.eq("user_id", body.user_id);
        }
        const { data, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ documents: data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "upload": {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin only" }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { user_id: targetId, title, doc_type, file_name } = body;
        if (!targetId || !title || !file_name) {
          return new Response(JSON.stringify({ error: "user_id, title, file_name required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const filePath = `${targetId}/${Date.now()}-${file_name}`;

        // Create signed upload URL
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("client-documents")
          .createSignedUploadUrl(filePath);

        if (uploadError) throw uploadError;

        // Insert document record
        const { data: doc, error: docError } = await supabase
          .from("documents")
          .insert({
            user_id: targetId,
            title,
            doc_type: doc_type || "other",
            file_path: filePath,
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (docError) throw docError;

        return new Response(JSON.stringify({ document: doc, upload_url: uploadData.signedUrl, upload_token: uploadData.token, file_path: filePath }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "download": {
        const { document_id } = body;
        if (!document_id) {
          return new Response(JSON.stringify({ error: "document_id required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let query = supabase.from("documents").select("*").eq("id", document_id);
        if (!isAdmin) query = query.eq("user_id", user.id);
        const { data: doc, error: docError } = await query.single();
        if (docError || !doc) {
          return new Response(JSON.stringify({ error: "Document not found" }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (doc.file_path) {
          const { data: signedUrl, error: urlError } = await supabase.storage
            .from("client-documents")
            .createSignedUrl(doc.file_path, 3600);
          if (urlError) throw urlError;
          return new Response(JSON.stringify({ url: signedUrl.signedUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ url: doc.file_url }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "client-kyc-upload": {
        const kycDocTypes = ["kyc_id", "kyc_address_proof", "kyc_selfie", "aml_source_of_funds", "aml_declaration"];
        const { doc_type, file_name, title: kycTitle } = body;

        if (!doc_type || !kycDocTypes.includes(doc_type)) {
          return new Response(JSON.stringify({ error: `doc_type must be one of: ${kycDocTypes.join(", ")}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        if (!file_name) {
          return new Response(JSON.stringify({ error: "file_name required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const kycFilePath = `${user.id}/kyc/${Date.now()}-${file_name}`;
        const { data: kycUploadData, error: kycUploadError } = await supabase.storage
          .from("client-documents")
          .createSignedUploadUrl(kycFilePath);
        if (kycUploadError) throw kycUploadError;

        const docTitle = kycTitle || doc_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const { data: kycDoc, error: kycDocError } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            title: docTitle,
            doc_type,
            file_path: kycFilePath,
            uploaded_by: user.id,
          })
          .select()
          .single();
        if (kycDocError) throw kycDocError;

        await supabase.from("app_users").update({ kyc_status: "submitted" }).eq("id", user.id);

        return new Response(JSON.stringify({
          document: kycDoc,
          upload_url: kycUploadData.signedUrl,
          upload_token: kycUploadData.token,
          file_path: kycFilePath,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "kyc-status": {
        const kycTypes = ["kyc_id", "kyc_address_proof", "kyc_selfie", "aml_source_of_funds", "aml_declaration"];
        const { data: kycDocs } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .in("doc_type", kycTypes)
          .order("created_at", { ascending: false });

        const { data: userData } = await supabase
          .from("app_users")
          .select("kyc_status")
          .eq("id", user.id)
          .single();

        return new Response(JSON.stringify({
          kyc_status: userData?.kyc_status || "pending",
          documents: kycDocs || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case "delete": {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Admin only" }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const { document_id } = body;
        const { data: doc } = await supabase.from("documents").select("file_path").eq("id", document_id).single();
        if (doc?.file_path) {
          await supabase.storage.from("client-documents").remove([doc.file_path]);
        }
        const { error } = await supabase.from("documents").delete().eq("id", document_id);
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
    console.error("manage-documents error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

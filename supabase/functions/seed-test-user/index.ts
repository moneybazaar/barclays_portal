import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

    const passwordHash = await hashPassword("M0n3y@12345678");
    const results: any = {};

    // 1. Upsert client user (with data)
    const { data: clientUser, error: clientErr } = await supabase
      .from("app_users")
      .upsert({
        email: "clientmock@yopmail.com",
        name: "James Richardson",
        auth_source: "external_auth",
        external_user_id: "clientmock@yopmail.com",
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" })
      .select()
      .single();

    if (clientErr) throw new Error(`Client user error: ${clientErr.message}`);

    // 2. Upsert client user (no data)
    const { data: clientNoData, error: clientNoDataErr } = await supabase
      .from("app_users")
      .upsert({
        email: "clientnodata@yopmail.com",
        name: "Emily Watson",
        auth_source: "external_auth",
        external_user_id: "clientnodata@yopmail.com",
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" })
      .select()
      .single();

    if (clientNoDataErr) throw new Error(`Client no-data user error: ${clientNoDataErr.message}`);

    // 3. Upsert admin user
    const { data: adminUser, error: adminErr } = await supabase
      .from("app_users")
      .upsert({
        email: "admin@yopmail.com",
        name: "Sarah Mitchell",
        auth_source: "external_auth",
        external_user_id: "admin@yopmail.com",
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" })
      .select()
      .single();

    if (adminErr) throw new Error(`Admin user error: ${adminErr.message}`);

    // 4. Set roles
    await supabase.from("app_user_roles").upsert(
      { user_id: clientUser.id, role: "client" },
      { onConflict: "user_id,role" }
    );
    await supabase.from("app_user_roles").upsert(
      { user_id: clientNoData.id, role: "client" },
      { onConflict: "user_id,role" }
    );
    await supabase.from("app_user_roles").upsert(
      { user_id: adminUser.id, role: "admin" },
      { onConflict: "user_id,role" }
    );

    // 5. Create sessions
    await supabase.from("app_sessions").delete().eq("user_id", clientUser.id);
    await supabase.from("app_sessions").delete().eq("user_id", clientNoData.id);
    await supabase.from("app_sessions").delete().eq("user_id", adminUser.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const clientToken = crypto.randomUUID();
    const clientNoDataToken = crypto.randomUUID();
    const adminToken = crypto.randomUUID();

    await supabase.from("app_sessions").insert({
      user_id: clientUser.id, token: clientToken, expires_at: expiresAt.toISOString(),
    });
    await supabase.from("app_sessions").insert({
      user_id: clientNoData.id, token: clientNoDataToken, expires_at: expiresAt.toISOString(),
    });
    await supabase.from("app_sessions").insert({
      user_id: adminUser.id, token: adminToken, expires_at: expiresAt.toISOString(),
    });

    // 6. Seed demo holdings for clientmock only
    await supabase.from("holdings").delete().eq("user_id", clientUser.id);
    await supabase.from("holdings").delete().eq("user_id", clientNoData.id);

    const demoHoldings = [
      { user_id: clientUser.id, asset_type: "stock", name: "Apple Inc.", ticker: "AAPL", shares: 500, purchase_price: 165.00, current_price: 178.45, currency: "USD", risk_level: "medium" },
      { user_id: clientUser.id, asset_type: "stock", name: "Microsoft Corp.", ticker: "MSFT", shares: 300, purchase_price: 380.00, current_price: 412.67, currency: "USD", risk_level: "medium" },
      { user_id: clientUser.id, asset_type: "stock", name: "NVIDIA Corp.", ticker: "NVDA", shares: 200, purchase_price: 750.00, current_price: 875.28, currency: "USD", risk_level: "high" },
      { user_id: clientUser.id, asset_type: "bond", name: "US Treasury 10Y", ticker: "US10Y", units: 1000, purchase_price: 97.50, current_price: 98.42, currency: "USD", risk_level: "low" },
      { user_id: clientUser.id, asset_type: "bond", name: "UK Gilt 10Y", ticker: "UKT10Y", units: 500, purchase_price: 94.00, current_price: 95.18, currency: "GBP", risk_level: "low" },
      { user_id: clientUser.id, asset_type: "fund", name: "Vanguard S&P 500", ticker: "VOO", shares: 800, purchase_price: 420.00, current_price: 445.23, currency: "USD", risk_level: "medium" },
      { user_id: clientUser.id, asset_type: "fund", name: "Fidelity Total Market", ticker: "FSKAX", shares: 1200, purchase_price: 110.00, current_price: 118.45, currency: "USD", risk_level: "medium" },
      { user_id: clientUser.id, asset_type: "cd", name: "6-Month CD", institution: "Barclays", principal: 500000, purchase_price: 500000, current_price: 500000, rate: 5.25, maturity_date: "2025-06-15", currency: "USD", risk_level: "low" },
      { user_id: clientUser.id, asset_type: "cd", name: "12-Month CD", institution: "HSBC", principal: 750000, purchase_price: 750000, current_price: 750000, rate: 5.45, maturity_date: "2025-12-20", currency: "USD", risk_level: "low" },
    ];

    const { error: holdingsErr } = await supabase.from("holdings").insert(demoHoldings);
    if (holdingsErr) throw new Error(`Holdings seed error: ${holdingsErr.message}`);

    results.client = {
      user: { id: clientUser.id, email: clientUser.email, name: clientUser.name },
      session_token: clientToken, role: "client",
    };
    results.clientNoData = {
      user: { id: clientNoData.id, email: clientNoData.email, name: clientNoData.name },
      session_token: clientNoDataToken, role: "client",
    };
    results.admin = {
      user: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
      session_token: adminToken, role: "admin",
    };

    return new Response(JSON.stringify({ success: true, accounts: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("seed-test-user error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AssetType = "stock" | "bond" | "fund" | "cd";

export interface Holding {
  id: string;
  user_id: string;
  asset_type: AssetType;
  name: string;
  ticker: string | null;
  institution: string | null;
  shares: number | null;
  units: number | null;
  principal: number | null;
  purchase_price: number;
  current_price: number;
  rate: number | null;
  maturity_date: string | null;
  currency: string;
  risk_level: string;
  created_at: string;
  updated_at: string;
}

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from("holdings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching holdings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addHolding = async (holding: Omit<Holding, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("holdings")
        .insert({ ...holding, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setHoldings((prev) => [data, ...prev]);
      toast({
        title: "Holding added",
        description: `${holding.name} has been added to your portfolio.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding holding",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateHolding = async (id: string, updates: Partial<Holding>) => {
    try {
      const { data, error } = await supabase
        .from("holdings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setHoldings((prev) => prev.map((h) => (h.id === id ? data : h)));
      toast({
        title: "Holding updated",
        description: "Your position has been updated.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating holding",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const { error } = await supabase.from("holdings").delete().eq("id", id);
      if (error) throw error;
      setHoldings((prev) => prev.filter((h) => h.id !== id));
      toast({
        title: "Holding removed",
        description: "Position has been removed from your portfolio.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error removing holding",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const seedDemoData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const demoHoldings = [
      { asset_type: "stock" as AssetType, name: "Apple Inc.", ticker: "AAPL", shares: 500, purchase_price: 165.00, current_price: 178.45, currency: "USD", risk_level: "medium" },
      { asset_type: "stock" as AssetType, name: "Microsoft Corp.", ticker: "MSFT", shares: 300, purchase_price: 380.00, current_price: 412.67, currency: "USD", risk_level: "medium" },
      { asset_type: "stock" as AssetType, name: "NVIDIA Corp.", ticker: "NVDA", shares: 200, purchase_price: 750.00, current_price: 875.28, currency: "USD", risk_level: "high" },
      { asset_type: "bond" as AssetType, name: "US Treasury 10Y", ticker: "US10Y", units: 1000, purchase_price: 97.50, current_price: 98.42, currency: "USD", risk_level: "low" },
      { asset_type: "bond" as AssetType, name: "UK Gilt 10Y", ticker: "UKT10Y", units: 500, purchase_price: 94.00, current_price: 95.18, currency: "GBP", risk_level: "low" },
      { asset_type: "fund" as AssetType, name: "Vanguard S&P 500", ticker: "VOO", shares: 800, purchase_price: 420.00, current_price: 445.23, currency: "USD", risk_level: "medium" },
      { asset_type: "fund" as AssetType, name: "Fidelity Total Market", ticker: "FSKAX", shares: 1200, purchase_price: 110.00, current_price: 118.45, currency: "USD", risk_level: "medium" },
      { asset_type: "cd" as AssetType, name: "6-Month CD", institution: "Barclays", principal: 500000, purchase_price: 500000, current_price: 500000, rate: 5.25, maturity_date: "2025-06-15", currency: "USD", risk_level: "low" },
      { asset_type: "cd" as AssetType, name: "12-Month CD", institution: "HSBC", principal: 750000, purchase_price: 750000, current_price: 750000, rate: 5.45, maturity_date: "2025-12-20", currency: "USD", risk_level: "low" },
    ];

    for (const holding of demoHoldings) {
      await supabase.from("holdings").insert({ ...holding, user_id: user.id });
    }
    
    await fetchHoldings();
    toast({
      title: "Demo data added",
      description: "Sample portfolio holdings have been added to your account.",
    });
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const stocks = holdings.filter((h) => h.asset_type === "stock");
  const bonds = holdings.filter((h) => h.asset_type === "bond");
  const funds = holdings.filter((h) => h.asset_type === "fund");
  const cds = holdings.filter((h) => h.asset_type === "cd");

  const totalValue = holdings.reduce((sum, h) => {
    const quantity = h.shares || h.units || h.principal || 0;
    return sum + quantity * h.current_price;
  }, 0);

  return {
    holdings,
    stocks,
    bonds,
    funds,
    cds,
    totalValue,
    loading,
    addHolding,
    updateHolding,
    deleteHolding,
    seedDemoData,
    refetch: fetchHoldings,
  };
};

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

const getSessionToken = () => localStorage.getItem("barclays_session_token");

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHoldings = async () => {
    try {
      const token = getSessionToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: token, action: "list" },
      });

      if (error) throw error;
      setHoldings(data?.holdings || []);
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
      const token = getSessionToken();
      if (!token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: token, action: "add", holding },
      });

      if (error) throw error;
      if (data?.holding) {
        setHoldings((prev) => [data.holding, ...prev]);
        toast({
          title: "Holding added",
          description: `${holding.name} has been added to your portfolio.`,
        });
      }
      return data?.holding || null;
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
      const token = getSessionToken();
      if (!token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: token, action: "update", holding_id: id, holding: updates },
      });

      if (error) throw error;
      if (data?.holding) {
        setHoldings((prev) => prev.map((h) => (h.id === id ? data.holding : h)));
        toast({
          title: "Holding updated",
          description: "Your position has been updated.",
        });
      }
      return data?.holding || null;
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
      const token = getSessionToken();
      if (!token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: token, action: "delete", holding_id: id },
      });

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
    refetch: fetchHoldings,
  };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Holding } from "@/hooks/useHoldings";
import { HoldingFormDialog } from "./HoldingFormDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface ClientProfile {
  id: string;
  email: string;
  name: string | null;
}

interface AdminHoldingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientProfile | null;
}

const SESSION_KEY = "barclays_session_token";

export const AdminHoldingsDialog = ({ open, onOpenChange, client }: AdminHoldingsDialogProps) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holdingToDelete, setHoldingToDelete] = useState<Holding | null>(null);
  const { toast } = useToast();

  const getToken = () => localStorage.getItem(SESSION_KEY);

  const fetchClientHoldings = async () => {
    if (!client) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: getToken(), action: "list", user_id: client.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setHoldings(data.holdings || []);
    } catch (error: any) {
      toast({ title: "Error fetching holdings", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && client) fetchClientHoldings();
    else setHoldings([]);
  }, [open, client]);

  const handleAddHolding = async (data: any) => {
    if (!client) return null;
    try {
      const { data: result, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: getToken(), action: "add", holding: { ...data, user_id: client.id } },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setHoldings((prev) => [result.holding, ...prev]);
      toast({ title: "Holding added", description: `${data.name} added to ${client.name || client.email}'s portfolio.` });
      return result.holding;
    } catch (error: any) {
      toast({ title: "Error adding holding", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const handleUpdateHolding = async (data: any) => {
    if (!editingHolding) return null;
    try {
      const { data: result, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: getToken(), action: "update", holding: data, holding_id: editingHolding.id },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setHoldings((prev) => prev.map((h) => (h.id === editingHolding.id ? result.holding : h)));
      toast({ title: "Holding updated" });
      return result.holding;
    } catch (error: any) {
      toast({ title: "Error updating holding", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!holdingToDelete) return;
    try {
      const { data: result, error } = await supabase.functions.invoke("manage-holdings", {
        body: { session_token: getToken(), action: "delete", holding_id: holdingToDelete.id },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setHoldings((prev) => prev.filter((h) => h.id !== holdingToDelete.id));
      toast({ title: "Holding removed" });
    } catch (error: any) {
      toast({ title: "Error removing holding", description: error.message, variant: "destructive" });
    } finally {
      setHoldingToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingHolding) return await handleUpdateHolding(data);
    return await handleAddHolding(data);
  };

  const totalValue = holdings.reduce((sum, h) => {
    const quantity = h.shares || h.units || h.principal || 0;
    return sum + Number(quantity) * Number(h.current_price);
  }, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg">Manage Holdings</span>
                {client && (
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    {client.name || "Unknown"} ({client.email})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingHolding(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Holding
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <p className="text-muted-foreground">This client has no holdings yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setEditingHolding(null); setFormOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Holding
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                      <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Type</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Quantity</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Price</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">P/L %</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Value</th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background">
                    {holdings.map((holding) => {
                      const quantity = holding.shares || holding.units || holding.principal || 0;
                      const value = Number(quantity) * Number(holding.current_price);
                      const plPercent = ((Number(holding.current_price) - Number(holding.purchase_price)) / Number(holding.purchase_price)) * 100;
                      const isPositive = plPercent >= 0;
                      return (
                        <tr key={holding.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="font-medium">{holding.name}</div>
                            {holding.ticker && <div className="text-xs text-muted-foreground font-mono">{holding.ticker}</div>}
                          </td>
                          <td className="p-3"><Badge variant="outline" className="capitalize">{holding.asset_type}</Badge></td>
                          <td className="p-3 text-right font-mono">
                            {holding.asset_type === "cd" ? formatCurrency(Number(quantity)) : Number(quantity).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono">${Number(holding.current_price).toFixed(2)}</td>
                          <td className="p-3 text-right">
                            <span className={`flex items-center justify-end gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {isPositive ? "+" : ""}{plPercent.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-semibold">{formatCurrency(value)}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setEditingHolding(holding); setFormOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setHoldingToDelete(holding); setDeleteConfirmOpen(true); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <HoldingFormDialog open={formOpen} onOpenChange={setFormOpen} onSubmit={handleFormSubmit} holding={editingHolding} />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{holdingToDelete?.name}" from this client's portfolio? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users, Eye, Plus } from "lucide-react";
import { AdminHoldingsDialog } from "./AdminHoldingsDialog";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface ClientWithStats extends Profile {
  totalValue: number;
  holdingsCount: number;
}

export const ClientManagement = () => {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [holdingsDialogOpen, setHoldingsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles (admin RLS allows this)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all holdings to calculate stats
      const { data: holdings, error: holdingsError } = await supabase
        .from("holdings")
        .select("user_id, shares, units, principal, current_price");

      if (holdingsError) throw holdingsError;

      // Calculate stats per client
      const clientsWithStats: ClientWithStats[] = (profiles || []).map((profile) => {
        const userHoldings = (holdings || []).filter((h) => h.user_id === profile.id);
        const totalValue = userHoldings.reduce((sum, h) => {
          const quantity = h.shares || h.units || h.principal || 0;
          return sum + Number(quantity) * Number(h.current_price);
        }, 0);

        return {
          ...profile,
          totalValue,
          holdingsCount: userHoldings.length,
        };
      });

      setClients(clientsWithStats);
    } catch (error: any) {
      toast({
        title: "Error fetching clients",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleManageHoldings = (client: ClientWithStats) => {
    setSelectedClient(client);
    setHoldingsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setHoldingsDialogOpen(false);
    setSelectedClient(null);
    fetchClients(); // Refresh stats after changes
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{clients.length} total clients</span>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm ? "No clients match your search." : "No registered clients yet."}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Client
                </th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Holdings
                </th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Portfolio Value
                </th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Joined
                </th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">
                      {client.full_name || "—"}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{client.email}</td>
                  <td className="p-4 text-right">
                    <Badge variant="secondary">{client.holdingsCount}</Badge>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {formatCurrency(client.totalValue)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageHoldings(client)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Manage Holdings
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminHoldingsDialog
        open={holdingsDialogOpen}
        onOpenChange={handleDialogClose}
        client={selectedClient}
      />
    </div>
  );
};

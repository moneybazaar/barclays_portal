import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Users, Eye, Plus, KeyRound, Pencil } from "lucide-react";
import { AdminHoldingsDialog } from "./AdminHoldingsDialog";

interface ClientWithStats {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  role: string;
  created_at: string;
  totalValue: number;
  holdingsCount: number;
}

export const ClientManagement = () => {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [holdingsDialogOpen, setHoldingsDialogOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null);
  const [newClient, setNewClient] = useState({ email: "", name: "", password: "", role: "client" });
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const getToken = () => localStorage.getItem("barclays_session_token");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "list-clients" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setClients(data.clients || []);
    } catch (error: any) {
      toast({ title: "Error fetching clients", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filteredClients = clients.filter(
    (c) => c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = async () => {
    if (!newClient.email || !newClient.password) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "create-client", ...newClient },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Client created", description: `${newClient.email} has been created.` });
      setCreateOpen(false);
      setNewClient({ email: "", name: "", password: "", role: "client" });
      fetchClients();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleEditClient = async () => {
    if (!editingClient) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "update-client", user_id: editingClient.id, ...editForm },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Client updated" });
      setEditOpen(false);
      fetchClients();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleResetPassword = async () => {
    if (!editingClient || !newPassword) return;
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "reset-password", user_id: editingClient.id, new_password: newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Password reset", description: "All sessions invalidated." });
      setResetPwOpen(false);
      setNewPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
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
          <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" />{clients.length} clients</span>
          <Button onClick={() => setCreateOpen(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Create Client</Button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{searchTerm ? "No clients match your search." : "No registered clients yet."}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Client</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Email</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Role</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Holdings</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Portfolio</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background">
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{client.name || "—"}</td>
                  <td className="p-4 text-muted-foreground">{client.email}</td>
                  <td className="p-4">
                    <Badge variant={client.role === "admin" ? "destructive" : "secondary"} className="capitalize">{client.role}</Badge>
                  </td>
                  <td className="p-4 text-right"><Badge variant="secondary">{client.holdingsCount}</Badge></td>
                  <td className="p-4 text-right font-semibold">{formatCurrency(client.totalValue)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedClient(client); setHoldingsDialogOpen(true); }} title="Manage Holdings">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setEditForm({ name: client.name || "", email: client.email, phone: client.phone || "", company: client.company || "" }); setEditOpen(true); }} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setResetPwOpen(true); }} title="Reset Password">
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminHoldingsDialog
        open={holdingsDialogOpen}
        onOpenChange={() => { setHoldingsDialogOpen(false); setSelectedClient(null); fetchClients(); }}
        client={selectedClient ? { id: selectedClient.id, email: selectedClient.email, name: selectedClient.name } : null}
      />

      {/* Create Client Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Client</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Email</Label><Input value={newClient.email} onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))} placeholder="client@example.com" /></div>
            <div><Label>Name</Label><Input value={newClient.name} onChange={(e) => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" /></div>
            <div><Label>Password</Label><Input type="password" value={newClient.password} onChange={(e) => setNewClient(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" /></div>
            <div>
              <Label>Role</Label>
              <Select value={newClient.role} onValueChange={(v) => setNewClient(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateClient} className="w-full" disabled={actionLoading || !newClient.email || !newClient.password}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Company</Label><Input value={editForm.company} onChange={(e) => setEditForm(p => ({ ...p, company: e.target.value }))} /></div>
            <Button onClick={handleEditClient} className="w-full" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password for {editingClient?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
            <p className="text-sm text-muted-foreground">This will invalidate all active sessions for this user.</p>
            <Button onClick={handleResetPassword} className="w-full" disabled={actionLoading || !newPassword}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

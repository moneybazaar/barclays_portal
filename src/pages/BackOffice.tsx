import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, DollarSign, TrendingUp, Shield, UserRoundCog, Loader2, Upload, Plus, FileText, BookOpen, StickyNote, Download, Trash2, Check, X as XIcon, QrCode, Mail, Copy, RefreshCw } from "lucide-react";
import { PaynowQRDialog } from "@/components/PaynowQRDialog";
import { useAuth } from "@/hooks/useAuth";
import { RoleManagement } from "@/components/RoleManagement";
import { ClientManagement } from "@/components/ClientManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  totalClients: number;
  totalAum: number;
  totalPositions: number;
}

interface DepositRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  reference_code: string;
  status: string;
  created_at: string;
  received_at: string | null;
}

interface DocumentRecord {
  id: string;
  user_id: string;
  title: string;
  doc_type: string;
  created_at: string;
}

interface ResearchPost {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
}

interface ClientNote {
  id: string;
  user_id: string;
  note: string;
  created_at: string;
}

interface KycClient {
  id: string;
  email: string;
  name: string | null;
  kyc_status: string | null;
  kyc_reviewed_at: string | null;
  kyc_documents: { id: string; title: string; doc_type: string; created_at: string; file_path: string | null }[];
}

export default function BackOffice() {
  const { userRole, loading, user, username, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Deposits
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [createDepositOpen, setCreateDepositOpen] = useState(false);
  const [newDeposit, setNewDeposit] = useState({ user_id: "", amount: "", currency: "USD" });
  const [clients, setClients] = useState<{ id: string; email: string; name: string | null }[]>([]);

  // Documents
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ user_id: "", title: "", doc_type: "other", file: null as File | null });

  // Research
  const [researchPosts, setResearchPosts] = useState<ResearchPost[]>([]);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchFormOpen, setResearchFormOpen] = useState(false);
  const [researchForm, setResearchForm] = useState({ title: "", summary: "", content: "", author: "" });

  // QR
  const [qrDeposit, setQrDeposit] = useState<DepositRecord | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  // KYC
  const [kycClients, setKycClients] = useState<KycClient[]>([]);
  const [kycLoading, setKycLoading] = useState(false);

  const getToken = () => localStorage.getItem("barclays_session_token");

  useEffect(() => {
    if (userRole !== "admin") return;
    const token = getToken();
    if (!token) return;

    // Fetch stats
    supabase.functions.invoke("admin-clients", {
      body: { session_token: token, action: "get-stats" },
    }).then(({ data }) => {
      if (data && !data.error) setStats(data);
      setStatsLoading(false);
    });

    // Fetch clients list for dropdowns
    supabase.functions.invoke("admin-clients", {
      body: { session_token: token, action: "list-clients" },
    }).then(({ data }) => {
      if (data?.clients) setClients(data.clients.map((c: any) => ({ id: c.id, email: c.email, name: c.name })));
    });
  }, [userRole]);

  // Fetch deposits
  const fetchDeposits = async () => {
    setDepositsLoading(true);
    const { data } = await supabase.functions.invoke("manage-deposits", {
      body: { session_token: getToken(), action: "list" },
    });
    setDeposits(data?.deposits || []);
    setDepositsLoading(false);
  };

  // Fetch documents
  const fetchDocuments = async () => {
    setDocsLoading(true);
    const { data } = await supabase.functions.invoke("manage-documents", {
      body: { session_token: getToken(), action: "list" },
    });
    setDocuments(data?.documents || []);
    setDocsLoading(false);
  };

  // Fetch research
  const fetchResearch = async () => {
    setResearchLoading(true);
    const { data } = await supabase.functions.invoke("admin-clients", {
      body: { session_token: getToken(), action: "list-research" },
    });
    setResearchPosts(data?.posts || []);
    setResearchLoading(false);
  };

  // Fetch KYC clients
  const fetchKycClients = async () => {
    setKycLoading(true);
    const { data } = await supabase.functions.invoke("admin-clients", {
      body: { session_token: getToken(), action: "list-kyc-clients" },
    });
    setKycClients(data?.clients || []);
    setKycLoading(false);
  };

  const handleKycAction = async (userId: string, status: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "update-kyc-status", user_id: userId, kyc_status: status },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: `KYC ${status}` });
      fetchKycClients();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const formatAum = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const handleCreateDeposit = async () => {
    if (!newDeposit.user_id || !newDeposit.amount) return;
    try {
      const { data, error } = await supabase.functions.invoke("manage-deposits", {
        body: { session_token: getToken(), action: "create", user_id: newDeposit.user_id, amount: Number(newDeposit.amount), currency: newDeposit.currency },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Deposit created", description: `Reference: ${data.deposit.reference_code}` });
      setCreateDepositOpen(false);
      setNewDeposit({ user_id: "", amount: "", currency: "USD" });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDepositStatus = async (depositId: string, status: string) => {
    try {
      await supabase.functions.invoke("manage-deposits", {
        body: { session_token: getToken(), action: "update-status", deposit_id: depositId, status },
      });
      toast({ title: `Deposit marked as ${status}` });
      fetchDeposits();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUploadDoc = async () => {
    if (!uploadData.user_id || !uploadData.title || !uploadData.file) return;
    try {
      const { data, error } = await supabase.functions.invoke("manage-documents", {
        body: {
          session_token: getToken(),
          action: "upload",
          user_id: uploadData.user_id,
          title: uploadData.title,
          doc_type: uploadData.doc_type,
          file_name: uploadData.file.name,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Upload the actual file
      if (data?.upload_url) {
        await fetch(data.upload_url, {
          method: "PUT",
          headers: { "Content-Type": uploadData.file.type },
          body: uploadData.file,
        });
      }

      toast({ title: "Document uploaded", description: uploadData.title });
      setUploadOpen(false);
      setUploadData({ user_id: "", title: "", doc_type: "other", file: null });
      fetchDocuments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await supabase.functions.invoke("manage-documents", {
        body: { session_token: getToken(), action: "delete", document_id: docId },
      });
      toast({ title: "Document deleted" });
      fetchDocuments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handlePublishResearch = async () => {
    if (!researchForm.title) return;
    try {
      const { data, error } = await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "create-research", ...researchForm },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Research published" });
      setResearchFormOpen(false);
      setResearchForm({ title: "", summary: "", content: "", author: "" });
      fetchResearch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteResearch = async (postId: string) => {
    try {
      await supabase.functions.invoke("admin-clients", {
        body: { session_token: getToken(), action: "delete-research", post_id: postId },
      });
      toast({ title: "Research deleted" });
      fetchResearch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getClientLabel = (userId: string) => {
    const c = clients.find(cl => cl.id === userId);
    return c ? (c.name || c.email) : userId.substring(0, 8);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Back Office Administration</h1>

        <Tabs defaultValue="overview" className="w-full" onValueChange={(v) => {
          if (v === "deposits") fetchDeposits();
          if (v === "documents") fetchDocuments();
          if (v === "research") fetchResearch();
          if (v === "kyc") fetchKycClients();
        }}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients"><UserRoundCog className="h-4 w-4 mr-1" />Clients</TabsTrigger>
            <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-1" />Roles</TabsTrigger>
            <TabsTrigger value="deposits"><DollarSign className="h-4 w-4 mr-1" />Deposits</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" />Documents</TabsTrigger>
            <TabsTrigger value="research"><BookOpen className="h-4 w-4 mr-1" />Research</TabsTrigger>
            <TabsTrigger value="kyc"><Shield className="h-4 w-4 mr-1" />KYC/AML</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Clients", icon: Users, value: stats?.totalClients },
                { label: "Assets Under Management", icon: DollarSign, value: stats?.totalAum, format: formatAum },
                { label: "Total Positions", icon: TrendingUp, value: stats?.totalPositions },
              ].map(({ label, icon: Icon, value, format }) => (
                <Card key={label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
                      <div className="text-2xl font-bold">{format ? format(value ?? 0) : (value ?? 0)}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clients */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <p className="text-sm text-muted-foreground">View all registered clients and manage their holdings</p>
              </CardHeader>
              <CardContent><ClientManagement /></CardContent>
            </Card>
          </TabsContent>

          {/* Roles */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <p className="text-sm text-muted-foreground">Assign and manage user roles</p>
              </CardHeader>
              <CardContent><RoleManagement /></CardContent>
            </Card>
          </TabsContent>

          {/* Deposits */}
          <TabsContent value="deposits" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Deposit Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Create and manage client deposits</p>
                </div>
                <Button onClick={() => setCreateDepositOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Deposit</Button>
              </CardHeader>
              <CardContent>
                {depositsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : deposits.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No deposits yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold">Client</th>
                          <th className="text-left p-3 font-semibold">Reference</th>
                          <th className="text-right p-3 font-semibold">Amount</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Date</th>
                          <th className="text-right p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deposits.map(dep => (
                          <tr key={dep.id} className="border-t">
                            <td className="p-3 text-sm">{getClientLabel(dep.user_id)}</td>
                            <td className="p-3 font-mono text-sm">{dep.reference_code}</td>
                            <td className="p-3 text-right font-semibold">{dep.currency === "GBP" ? "£" : "$"}{Number(dep.amount).toLocaleString()}</td>
                            <td className="p-3">
                              <Badge variant={dep.status === "received" ? "default" : "secondary"} className="capitalize">{dep.status}</Badge>
                            </td>
                            <td className="p-3 text-sm">{new Date(dep.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => { setQrDeposit(dep); setQrOpen(true); }}>
                                  <QrCode className="h-3 w-3" />
                                </Button>
                                {dep.status === "pending" && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleDepositStatus(dep.id, "received")}>
                                      <Check className="h-3 w-3 mr-1" />Received
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDepositStatus(dep.id, "cancelled")}>
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            <PaynowQRDialog open={qrOpen} onOpenChange={setQrOpen} deposit={qrDeposit} />
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Document Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Upload and manage client documents</p>
                </div>
                <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : documents.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold">Title</th>
                          <th className="text-left p-3 font-semibold">Client</th>
                          <th className="text-left p-3 font-semibold">Type</th>
                          <th className="text-left p-3 font-semibold">Date</th>
                          <th className="text-right p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.id} className="border-t">
                            <td className="p-3 font-medium">{doc.title}</td>
                            <td className="p-3 text-sm">{getClientLabel(doc.user_id)}</td>
                            <td className="p-3"><Badge variant="secondary" className="capitalize">{doc.doc_type}</Badge></td>
                            <td className="p-3 text-sm">{new Date(doc.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteDoc(doc.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research */}
          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Research Publishing</CardTitle>
                  <p className="text-sm text-muted-foreground">Publish research posts visible to clients</p>
                </div>
                <Button onClick={() => setResearchFormOpen(true)}><Plus className="h-4 w-4 mr-2" />New Post</Button>
              </CardHeader>
              <CardContent>
                {researchLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : researchPosts.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No research posts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {researchPosts.map(post => (
                      <Card key={post.id}>
                        <CardContent className="pt-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.summary && <p className="text-sm text-muted-foreground mt-1">{post.summary}</p>}
                            <p className="text-xs text-muted-foreground mt-2">
                              {post.author && `By ${post.author} · `}{new Date(post.published_at || post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteResearch(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* KYC/AML */}
          <TabsContent value="kyc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC / AML Review</CardTitle>
                <p className="text-sm text-muted-foreground">Review client identity verification documents</p>
              </CardHeader>
              <CardContent>
                {kycLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : kycClients.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No clients found.</p>
                ) : (
                  <div className="space-y-4">
                    {kycClients.map(client => (
                      <Card key={client.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold">{client.name || client.email}</p>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                client.kyc_status === "approved" ? "default" :
                                client.kyc_status === "rejected" ? "destructive" :
                                client.kyc_status === "submitted" ? "secondary" : "outline"
                              } className="capitalize">
                                {client.kyc_status || "pending"}
                              </Badge>
                              {client.kyc_status === "submitted" && (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="default" onClick={() => handleKycAction(client.id, "approved")}>
                                    <Check className="h-3 w-3 mr-1" />Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleKycAction(client.id, "rejected")}>
                                    <XIcon className="h-3 w-3 mr-1" />Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          {client.kyc_documents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {client.kyc_documents.map(doc => (
                                <div key={doc.id} className="flex items-center gap-2 p-2 rounded bg-muted text-sm">
                                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground">{doc.doc_type.replace(/_/g, " ")} · {new Date(doc.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No KYC documents uploaded</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Deposit Dialog */}
      <Dialog open={createDepositOpen} onOpenChange={setCreateDepositOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Deposit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={newDeposit.user_id} onValueChange={(v) => setNewDeposit(p => ({ ...p, user_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name || c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={newDeposit.amount} onChange={(e) => setNewDeposit(p => ({ ...p, amount: e.target.value }))} placeholder="10000" />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={newDeposit.currency} onValueChange={(v) => setNewDeposit(p => ({ ...p, currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateDeposit} className="w-full">Create Deposit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={uploadData.user_id} onValueChange={(v) => setUploadData(p => ({ ...p, user_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name || c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={uploadData.title} onChange={(e) => setUploadData(p => ({ ...p, title: e.target.value }))} placeholder="Q1 Statement" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={uploadData.doc_type} onValueChange={(v) => setUploadData(p => ({ ...p, doc_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="statement">Statement</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File</Label>
              <Input type="file" onChange={(e) => setUploadData(p => ({ ...p, file: e.target.files?.[0] || null }))} />
            </div>
            <Button onClick={handleUploadDoc} className="w-full" disabled={!uploadData.file || !uploadData.user_id || !uploadData.title}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Research Dialog */}
      <Dialog open={researchFormOpen} onOpenChange={setResearchFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publish Research</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={researchForm.title} onChange={(e) => setResearchForm(p => ({ ...p, title: e.target.value }))} placeholder="Q1 Global Outlook" />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={researchForm.author} onChange={(e) => setResearchForm(p => ({ ...p, author: e.target.value }))} placeholder="Research Team" />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea value={researchForm.summary} onChange={(e) => setResearchForm(p => ({ ...p, summary: e.target.value }))} placeholder="Brief summary..." />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={researchForm.content} onChange={(e) => setResearchForm(p => ({ ...p, content: e.target.value }))} rows={6} placeholder="Full content..." />
            </div>
            <Button onClick={handlePublishResearch} className="w-full" disabled={!researchForm.title}>Publish</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

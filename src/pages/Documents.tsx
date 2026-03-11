import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  title: string;
  doc_type: string;
  file_url: string | null;
  file_path: string | null;
  created_at: string;
}

export default function Documents() {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const getToken = () => localStorage.getItem("barclays_session_token");

  useEffect(() => {
    const fetchDocs = async () => {
      const token = getToken();
      if (!token) { setDocsLoading(false); return; }
      try {
        const { data, error } = await supabase.functions.invoke("manage-documents", {
          body: { session_token: token, action: "list" },
        });
        if (error) throw error;
        setDocuments(data?.documents || []);
      } catch (err: any) {
        toast({ title: "Error loading documents", description: err.message, variant: "destructive" });
      } finally {
        setDocsLoading(false);
      }
    };
    if (!loading) fetchDocs();
  }, [loading]);

  const handleDownload = async (doc: Document) => {
    try {
      const token = getToken();
      if (!token) return;
      const { data, error } = await supabase.functions.invoke("manage-documents", {
        body: { session_token: token, action: "download", document_id: doc.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "No file available", description: "This document has no file attached.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredDocs = filter === "all" ? documents : documents.filter(d => d.doc_type === filter);

  const docTypes = [...new Set(documents.map(d => d.doc_type))];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "statement": return "bg-blue-100 text-blue-700";
      case "contract": return "bg-green-100 text-green-700";
      case "invoice": return "bg-yellow-100 text-yellow-700";
      case "report": return "bg-purple-100 text-purple-700";
      case "tax": return "bg-orange-100 text-orange-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {docTypes.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {docsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents</h3>
              <p className="text-muted-foreground">
                {filter !== "all" ? "No documents match this filter." : "Your documents will appear here once uploaded by your advisor."}
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Document</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Date</th>
                      <th className="text-right p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.title}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs capitalize ${getTypeBadgeColor(doc.doc_type)}`}>
                            {doc.doc_type}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} className="gap-2">
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Compliance Notice:</strong> All documents are encrypted and stored securely. Contact your advisor for document requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle2, Clock, XCircle, FileText, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface KycDocument {
  id: string;
  title: string;
  doc_type: string;
  created_at: string;
}

const KYC_DOC_TYPES = [
  { type: "kyc_id", label: "ID Document", description: "Passport, driving licence, or national ID" },
  { type: "kyc_address_proof", label: "Proof of Address", description: "Utility bill or bank statement (< 3 months)" },
  { type: "kyc_selfie", label: "Selfie Verification", description: "Clear photo of yourself holding your ID" },
  { type: "aml_source_of_funds", label: "Source of Funds", description: "Documentation showing origin of funds" },
  { type: "aml_declaration", label: "AML Declaration", description: "Signed anti-money laundering declaration" },
];

export default function KycUpload() {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getToken = () => localStorage.getItem("barclays_session_token");

  const fetchKycStatus = async () => {
    setFetching(true);
    try {
      const { data } = await supabase.functions.invoke("manage-documents", {
        body: { session_token: getToken(), action: "kyc-status" },
      });
      if (data) {
        setKycStatus(data.kyc_status || "pending");
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch KYC status", err);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user) fetchKycStatus();
  }, [user]);

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType);
    try {
      const { data, error } = await supabase.functions.invoke("manage-documents", {
        body: {
          session_token: getToken(),
          action: "client-kyc-upload",
          doc_type: docType,
          file_name: file.name,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.upload_url) {
        await fetch(data.upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      }

      toast({ title: "Document uploaded", description: `${docType.replace(/_/g, " ")} submitted successfully` });
      fetchKycStatus();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "submitted":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getUploadedDoc = (docType: string) => documents.find((d) => d.doc_type === docType);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav username={username} userRole={userRole} />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Status Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>KYC / AML Verification</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload required documents to verify your identity
                </p>
              </div>
            </div>
            {getStatusBadge(kycStatus)}
          </CardHeader>
          {kycStatus === "approved" && (
            <CardContent>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your identity has been verified. No further action is needed.
              </p>
            </CardContent>
          )}
          {kycStatus === "rejected" && (
            <CardContent>
              <p className="text-sm text-destructive">
                Your verification was not approved. Please re-upload corrected documents.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Document Upload Cards */}
        {fetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            {KYC_DOC_TYPES.map(({ type, label, description }) => {
              const uploaded = getUploadedDoc(type);
              const isUploading = uploading === type;

              return (
                <Card key={type} className={uploaded ? "border-green-200 dark:border-green-800" : ""}>
                  <CardContent className="flex items-center justify-between py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${uploaded ? "bg-green-100 dark:bg-green-900" : "bg-muted"}`}>
                        {uploaded ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                        {uploaded && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Uploaded {new Date(uploaded.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        type="file"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[type] = el; }}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(type, file);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        variant={uploaded ? "outline" : "default"}
                        size="sm"
                        disabled={isUploading || kycStatus === "approved"}
                        onClick={() => fileInputRefs.current[type]?.click()}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        {uploaded ? "Replace" : "Upload"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

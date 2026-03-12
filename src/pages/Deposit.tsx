import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Copy, Loader2, QrCode } from "lucide-react";
import { PaynowQRDialog } from "@/components/PaynowQRDialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DepositRecord {
  id: string;
  amount: number;
  currency: string;
  reference_code: string;
  status: string;
  created_at: string;
  received_at: string | null;
}

const bankDetails = {
  iban: "GB29 NWBK 6016 1331 9268 19",
  swift: "BARCGB22",
  sortCode: "20-00-00",
  accountNumber: "13319268",
  accountName: "Barclays IB Client Account",
};

export default function Deposit() {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(true);
  const [qrDeposit, setQrDeposit] = useState<DepositRecord | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const getToken = () => localStorage.getItem("barclays_session_token");

  useEffect(() => {
    const fetchDeposits = async () => {
      const token = getToken();
      if (!token) { setDepositsLoading(false); return; }
      try {
        const { data, error } = await supabase.functions.invoke("manage-deposits", {
          body: { session_token: token, action: "list" },
        });
        if (error) throw error;
        setDeposits(data?.deposits || []);
      } catch { /* ignore */ }
      setDepositsLoading(false);
    };
    if (!loading) fetchDeposits();
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied.` });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received": return <Badge className="bg-green-100 text-green-700">Received</Badge>;
      case "sent": return <Badge className="bg-blue-100 text-blue-700">Sent</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const hasPending = deposits.some(d => d.status === "pending" || d.status === "sent");

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Deposit Funds</h1>
              <p className="text-muted-foreground mt-1">Transfer funds to your investment account</p>
            </div>
            {hasPending && <Badge variant="secondary" className="text-sm">Pending Deposit</Badge>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "IBAN", value: bankDetails.iban },
                  { label: "SWIFT/BIC", value: bankDetails.swift },
                  { label: "Sort Code", value: bankDetails.sortCode },
                  { label: "Account Number", value: bankDetails.accountNumber },
                  { label: "Account Name", value: bankDetails.accountName },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-mono font-semibold">{value}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value, label)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>How to Deposit</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {[
                    { title: "Log into your bank", desc: "Access your online banking or mobile app." },
                    { title: "Add beneficiary", desc: "Use the account details provided." },
                    { title: "Initiate transfer", desc: "Enter the amount and your reference code." },
                    { title: "Confirm deposit", desc: "Funds typically arrive within 1-2 business days." },
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm"><strong>Important:</strong> Always include your unique reference code in the transfer description.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit History */}
          <Card>
            <CardHeader><CardTitle>Deposit History</CardTitle></CardHeader>
            <CardContent>
              {depositsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : deposits.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No deposit records yet. Your deposits will appear here once processed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Reference</th>
                        <th className="text-right p-3 font-semibold">Amount</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Date</th>
                        <th className="text-left p-3 font-semibold">Received</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr key={dep.id} className="border-t">
                          <td className="p-3 font-mono text-sm">{dep.reference_code}</td>
                          <td className="p-3 text-right font-semibold">
                            {dep.currency === "GBP" ? "£" : "$"}{Number(dep.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">{getStatusBadge(dep.status)}</td>
                          <td className="p-3 text-sm">{new Date(dep.created_at).toLocaleDateString()}</td>
                          <td className="p-3 text-sm">{dep.received_at ? new Date(dep.received_at).toLocaleDateString() : "—"}</td>
                          <td className="p-3 text-right">
                            {(dep.status === "pending" || dep.status === "sent") && (
                              <Button size="sm" variant="ghost" onClick={() => { setQrDeposit(dep); setQrOpen(true); }}>
                                <QrCode className="h-4 w-4 mr-1" />QR
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

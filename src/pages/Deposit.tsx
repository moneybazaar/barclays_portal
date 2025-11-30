import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Info, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockAccountDetails = {
  iban: "GB29 NWBK 6016 1331 9268 19",
  swift: "BARCGB22",
  sortCode: "20-00-00",
  accountNumber: "13319268",
  accountName: "Barclays IB Client Account",
};

export default function Deposit() {
  const { user, loading, username, userRole } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [hasPendingDeposit] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied successfully.`,
    });
  };

  const handleGenerateQR = () => {
    setShowQR(true);
    toast({
      title: "QR Code Generated",
      description: "Use this QR code for mobile banking transfers.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardNav username={username} userRole={userRole} />
      <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Deposit Funds</h1>
            <p className="text-muted-foreground mt-1">Transfer funds to your investment account</p>
          </div>
          {hasPendingDeposit && (
            <Badge variant="secondary" className="text-sm">
              Pending Deposit
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">IBAN</p>
                      <p className="font-mono font-semibold">{mockAccountDetails.iban}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(mockAccountDetails.iban, "IBAN")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">SWIFT/BIC</p>
                      <p className="font-mono font-semibold">{mockAccountDetails.swift}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(mockAccountDetails.swift, "SWIFT")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sort Code</p>
                      <p className="font-mono font-semibold">{mockAccountDetails.sortCode}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(mockAccountDetails.sortCode, "Sort Code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <p className="font-mono font-semibold">{mockAccountDetails.accountNumber}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(mockAccountDetails.accountNumber, "Account Number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="font-semibold">{mockAccountDetails.accountName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerateQR} className="w-full gap-2">
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>

              {showQR && (
                <div className="flex justify-center p-6 bg-white rounded-lg animate-fade-in">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-lg">
                    <QrCode className="h-32 w-32 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Log into your bank</p>
                    <p className="text-sm text-muted-foreground">
                      Access your online banking or mobile app.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Add beneficiary</p>
                    <p className="text-sm text-muted-foreground">
                      Use the account details provided above.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Initiate transfer</p>
                    <p className="text-sm text-muted-foreground">
                      Enter the amount and reference number.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-semibold">Confirm deposit</p>
                    <p className="text-sm text-muted-foreground">
                      Funds typically arrive within 1-2 business days.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Important:</strong> Always include your unique client reference number in the transfer description to ensure proper crediting.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

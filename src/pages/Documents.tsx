import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockDocuments = {
  aml: [
    { name: "KYC Verification", type: "PDF", uploaded: "2024-01-15", status: "Verified" },
    { name: "Source of Funds", type: "PDF", uploaded: "2024-01-20", status: "Verified" },
    { name: "ID Document", type: "PDF", uploaded: "2024-01-10", status: "Verified" },
  ],
  contracts: [
    { name: "Investment Mandate", type: "PDF", uploaded: "2024-02-01", status: "Signed" },
    { name: "Advisory Agreement", type: "PDF", uploaded: "2024-02-05", status: "Signed" },
    { name: "Fee Schedule", type: "PDF", uploaded: "2024-02-01", status: "Active" },
  ],
  other: [
    { name: "Q4 2024 Report", type: "PDF", uploaded: "2024-11-30", status: "Available" },
    { name: "Tax Statement", type: "PDF", uploaded: "2024-03-15", status: "Available" },
    { name: "Performance Summary", type: "XLSX", uploaded: "2024-11-01", status: "Available" },
  ],
};

export default function Documents() {
  const { user, loading, username, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("aml");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleDownloadAll = (category: string) => {
    toast({
      title: "Download Started",
      description: `All ${category.toUpperCase()} documents are being downloaded...`,
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload Successful",
      description: "Your document has been uploaded successfully.",
    });
  };

  const handleDownload = (docName: string) => {
    toast({
      title: "Download Started",
      description: `${docName} is being downloaded...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardNav username={username} userRole={userRole} />
      <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
          <Button onClick={handleUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="aml">AML Docs</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="aml" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleDownloadAll("aml")} className="gap-2">
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Uploaded</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-right p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDocuments.aml.map((doc, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </td>
                        <td className="p-4">{doc.type}</td>
                        <td className="p-4">{doc.uploaded}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.name)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleDownloadAll("contracts")} className="gap-2">
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Uploaded</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-right p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDocuments.contracts.map((doc, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </td>
                        <td className="p-4">{doc.type}</td>
                        <td className="p-4">{doc.uploaded}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.name)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="other" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleDownloadAll("other")} className="gap-2">
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Uploaded</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-right p-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDocuments.other.map((doc, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </td>
                        <td className="p-4">{doc.type}</td>
                        <td className="p-4">{doc.uploaded}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.name)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Compliance Notice:</strong> All documents are encrypted and stored securely in compliance with FCA regulations.
            This portal is for demonstration purposes only. All data and entities are fictitious.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

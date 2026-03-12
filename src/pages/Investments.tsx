import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHoldings, Holding, AssetType } from "@/hooks/useHoldings";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { HoldingFormDialog } from "@/components/HoldingFormDialog";
import { PortfolioCharts } from "@/components/PortfolioCharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Plus, Database, Pencil, Trash2, BarChart3, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Investments() {
  const { user, loading: authLoading, username, userRole, signOut } = useAuth();
  const { holdings, stocks, bonds, funds, cds, totalValue, loading: holdingsLoading, addHolding, updateHolding, deleteHolding } = useHoldings();
  const [filter, setFilter] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState<Holding | null>(null);
  const [liveUpdate, setLiveUpdate] = useState(0);
  const [activeTab, setActiveTab] = useState("stocks");
  const [viewMode, setViewMode] = useState<"holdings" | "analytics">("holdings");
  const [formOpen, setFormOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holdingToDelete, setHoldingToDelete] = useState<Holding | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdate((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loading = authLoading || holdingsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getLiveChange = () => (Math.random() - 0.5) * 2;

  const isEmpty = stocks.length === 0 && bonds.length === 0 && funds.length === 0 && cds.length === 0;

  const getDefaultAssetType = (): AssetType => {
    const map: Record<string, AssetType> = { stocks: "stock", bonds: "bond", funds: "fund", cds: "cd" };
    return map[activeTab] || "stock";
  };

  const isAdmin = userRole === "admin";

  const handleAddNew = () => {
    setEditingHolding(null);
    setFormOpen(true);
  };

  const handleEdit = (holding: Holding) => {
    setEditingHolding(holding);
    setSelectedPosition(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (holding: Holding) => {
    setHoldingToDelete(holding);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (holdingToDelete) {
      await deleteHolding(holdingToDelete.id);
      setHoldingToDelete(null);
      setSelectedPosition(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingHolding) {
      return await updateHolding(editingHolding.id, data);
    }
    return await addHolding(data);
  };

  const renderTable = (items: Holding[], type: "stock" | "bond" | "fund" | "cd") => {
    if (items.length === 0) {
      return (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No {type}s in your portfolio yet.</p>
          {isAdmin && (
            <Button variant="outline" className="mt-4" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          )}
        </Card>
      );
    }

    const isCD = type === "cd";
    const isBond = type === "bond";

    return (
      <Card className="overflow-hidden bg-white border shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="border-b">
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">{isCD ? "Institution" : "Ticker"}</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">{isCD ? "Principal" : isBond ? "Units" : "Shares"}</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">{isCD ? "Rate %" : "Price"}</th>
                {!isCD && <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Change %</th>}
                {isCD && <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Maturity</th>}
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const change = isCD ? 0 : getLiveChange() * (isBond ? 0.1 : 1);
                const livePrice = item.current_price * (1 + change / 100);
                const quantity = item.shares || item.units || item.principal || 0;
                const liveValue = isCD ? item.principal || 0 : quantity * livePrice;

                return (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPosition(item)}
                  >
                    <td className="p-4">{item.name}</td>
                    <td className="p-4 font-mono">{isCD ? item.institution : item.ticker}</td>
                    <td className="p-4 text-right">{isCD ? `$${quantity.toLocaleString()}` : quantity.toLocaleString()}</td>
                    <td className="p-4 text-right">{isCD ? `${item.rate?.toFixed(2)}%` : `$${livePrice.toFixed(2)}`}</td>
                    {!isCD && (
                      <td className="p-4 text-right">
                        <span className={`flex items-center justify-end gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                        </span>
                      </td>
                    )}
                    {isCD && <td className="p-4">{item.maturity_date}</td>}
                    <td className="p-4 text-right font-semibold">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
              <Badge variant="outline" className="gap-2 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Live
              </Badge>
            </div>
            <p className="text-xl font-semibold text-accent mt-2">
              Total Holdings: ${(totalValue / 1000000).toFixed(2)}M
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="medium-risk">Medium Risk</SelectItem>
                <SelectItem value="low-risk">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "holdings" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("holdings")}
                className="rounded-none"
              >
                <List className="h-4 w-4 mr-2" />
                Holdings
              </Button>
              <Button
                variant={viewMode === "analytics" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("analytics")}
                className="rounded-none"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {isEmpty ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No Holdings Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your portfolio is empty. Click "Add Holding" to add your first investment, or load demo data to explore.
              </p>
            </div>
          </Card>
        ) : viewMode === "analytics" ? (
          <PortfolioCharts holdings={holdings} totalValue={totalValue} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stocks">Stocks ({stocks.length})</TabsTrigger>
              <TabsTrigger value="bonds">Bonds ({bonds.length})</TabsTrigger>
              <TabsTrigger value="funds">Funds ({funds.length})</TabsTrigger>
              <TabsTrigger value="cds">CDs ({cds.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-4">{renderTable(stocks, "stock")}</TabsContent>
            <TabsContent value="bonds" className="space-y-4">{renderTable(bonds, "bond")}</TabsContent>
            <TabsContent value="funds" className="space-y-4">{renderTable(funds, "fund")}</TabsContent>
            <TabsContent value="cds" className="space-y-4">{renderTable(cds, "cd")}</TabsContent>
          </Tabs>
        )}

        <Sheet open={!!selectedPosition} onOpenChange={() => setSelectedPosition(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Position Details</SheetTitle>
            </SheetHeader>
            {selectedPosition && (
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{selectedPosition.name}</p>
                </div>
                {selectedPosition.ticker && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ticker</p>
                    <p className="text-lg font-mono">{selectedPosition.ticker}</p>
                  </div>
                )}
                {selectedPosition.institution && (
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="text-lg">{selectedPosition.institution}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Asset Type</p>
                  <Badge variant="outline" className="capitalize">{selectedPosition.asset_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge variant={selectedPosition.risk_level === "high" ? "destructive" : selectedPosition.risk_level === "low" ? "secondary" : "default"} className="capitalize">
                    {selectedPosition.risk_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold text-accent">
                    ${((selectedPosition.shares || selectedPosition.units || selectedPosition.principal || 0) * selectedPosition.current_price).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            <SheetFooter className="mt-8 gap-2">
              <Button variant="outline" onClick={() => handleEdit(selectedPosition!)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteClick(selectedPosition!)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <HoldingFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          holding={editingHolding}
          defaultAssetType={getDefaultAssetType()}
        />

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Holding</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{holdingToDelete?.name}"? This action cannot be undone.
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
      </div>
    </div>
  );
}

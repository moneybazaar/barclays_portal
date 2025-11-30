import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHoldings, Holding } from "@/hooks/useHoldings";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, TrendingDown, Plus, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Investments() {
  const { user, loading: authLoading, username, userRole } = useAuth();
  const { stocks, bonds, funds, cds, totalValue, loading: holdingsLoading, seedDemoData } = useHoldings();
  const [filter, setFilter] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState<Holding | null>(null);
  const [liveUpdate, setLiveUpdate] = useState(0);

  // Real-time price simulation every 3 seconds
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

  const getLiveChange = (basePrice: number) => {
    return (Math.random() - 0.5) * 2;
  };

  const isEmpty = stocks.length === 0 && bonds.length === 0 && funds.length === 0 && cds.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DashboardNav username={username} userRole={userRole} />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
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
          <div className="flex gap-2">
            {isEmpty && (
              <Button variant="outline" onClick={seedDemoData}>
                <Database className="h-4 w-4 mr-2" />
                Load Demo Data
              </Button>
            )}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="medium-risk">Medium Risk</SelectItem>
                <SelectItem value="low-risk">Low Risk</SelectItem>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="gbp">GBP</SelectItem>
              </SelectContent>
            </Select>
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
                Your portfolio is empty. Click "Load Demo Data" to see sample holdings, or add your first investment.
              </p>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="stocks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stocks">Stocks ({stocks.length})</TabsTrigger>
              <TabsTrigger value="bonds">Bonds ({bonds.length})</TabsTrigger>
              <TabsTrigger value="funds">Funds ({funds.length})</TabsTrigger>
              <TabsTrigger value="cds">CDs ({cds.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-4">
              <Card className="overflow-hidden bg-white border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Ticker</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Shares</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Price</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Change %</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stock) => {
                        const change = getLiveChange(stock.current_price);
                        const livePrice = stock.current_price * (1 + change / 100);
                        const liveValue = (stock.shares || 0) * livePrice;
                        return (
                          <tr
                            key={stock.id}
                            className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedPosition(stock)}
                          >
                            <td className="p-4">{stock.name}</td>
                            <td className="p-4 font-mono">{stock.ticker}</td>
                            <td className="p-4 text-right">{stock.shares}</td>
                            <td className="p-4 text-right transition-all duration-500">${livePrice.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <span className={`flex items-center justify-end gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="p-4 text-right font-semibold">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bonds" className="space-y-4">
              <Card className="overflow-hidden bg-white border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Ticker</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Units</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Price</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Change %</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonds.map((bond) => {
                        const change = getLiveChange(bond.current_price) * 0.1;
                        const livePrice = bond.current_price * (1 + change / 100);
                        const liveValue = (bond.units || 0) * livePrice;
                        return (
                          <tr
                            key={bond.id}
                            className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedPosition(bond)}
                          >
                            <td className="p-4">{bond.name}</td>
                            <td className="p-4 font-mono">{bond.ticker}</td>
                            <td className="p-4 text-right">{bond.units}</td>
                            <td className="p-4 text-right">${livePrice.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <span className={`flex items-center justify-end gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="p-4 text-right font-semibold">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="funds" className="space-y-4">
              <Card className="overflow-hidden bg-white border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Ticker</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Shares</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Price</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Change %</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funds.map((fund) => {
                        const change = getLiveChange(fund.current_price);
                        const livePrice = fund.current_price * (1 + change / 100);
                        const liveValue = (fund.shares || 0) * livePrice;
                        return (
                          <tr
                            key={fund.id}
                            className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedPosition(fund)}
                          >
                            <td className="p-4">{fund.name}</td>
                            <td className="p-4 font-mono">{fund.ticker}</td>
                            <td className="p-4 text-right">{fund.shares}</td>
                            <td className="p-4 text-right">${livePrice.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <span className={`flex items-center justify-end gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="p-4 text-right font-semibold">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="cds" className="space-y-4">
              <Card className="overflow-hidden bg-white border shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Institution</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Principal</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Rate %</th>
                        <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Maturity</th>
                        <th className="text-right p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cds.map((cd) => (
                        <tr
                          key={cd.id}
                          className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedPosition(cd)}
                        >
                          <td className="p-4">{cd.name}</td>
                          <td className="p-4">{cd.institution}</td>
                          <td className="p-4 text-right">${cd.principal?.toLocaleString()}</td>
                          <td className="p-4 text-right">{cd.rate?.toFixed(2)}%</td>
                          <td className="p-4">{cd.maturity_date}</td>
                          <td className="p-4 text-right font-semibold">${cd.principal?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
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
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

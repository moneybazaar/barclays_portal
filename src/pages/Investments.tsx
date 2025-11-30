import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockData = {
  stocks: [
    { name: "Apple Inc.", ticker: "AAPL", shares: 500, price: 178.45, change: 1.23, value: 89225 },
    { name: "Microsoft Corp.", ticker: "MSFT", shares: 300, price: 412.67, change: -0.45, value: 123801 },
    { name: "NVIDIA Corp.", ticker: "NVDA", shares: 200, price: 875.28, change: 2.18, value: 175056 },
  ],
  bonds: [
    { name: "US Treasury 10Y", ticker: "US10Y", units: 1000, price: 98.42, change: 0.12, value: 98420 },
    { name: "UK Gilt 10Y", ticker: "UKT10Y", units: 500, price: 95.18, change: -0.08, value: 47590 },
  ],
  funds: [
    { name: "Vanguard S&P 500", ticker: "VOO", shares: 800, price: 445.23, change: 0.89, value: 356184 },
    { name: "Fidelity Total Market", ticker: "FSKAX", shares: 1200, price: 118.45, change: 0.56, value: 142140 },
  ],
  cds: [
    { name: "6-Month CD", institution: "Barclays", principal: 500000, rate: 5.25, maturity: "2025-06-15", value: 500000 },
    { name: "12-Month CD", institution: "HSBC", principal: 750000, rate: 5.45, maturity: "2025-12-20", value: 750000 },
  ],
};

const totalHoldings = 12450000;

export default function Investments() {
  const { user, loading, username, userRole } = useAuth();
  const [filter, setFilter] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [liveUpdate, setLiveUpdate] = useState(0);

  // Real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Apply live fluctuations to mock data
  const getLiveValue = (baseValue: number, change: number) => {
    const fluctuation = (Math.random() - 0.5) * 0.3;
    return baseValue * (1 + (change + fluctuation) / 100);
  };

  const getLiveChange = (baseChange: number) => {
    return baseChange + (Math.random() - 0.5) * 0.2;
  };

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
              Total Holdings: ${((totalHoldings + (Math.random() - 0.5) * 50000) / 1000000).toFixed(2)}M
            </p>
          </div>
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

        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="bonds">Bonds</TabsTrigger>
            <TabsTrigger value="funds">Funds</TabsTrigger>
            <TabsTrigger value="cds">CDs</TabsTrigger>
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
                    {mockData.stocks.map((stock, idx) => {
                      const liveChange = getLiveChange(stock.change);
                      const livePrice = stock.price * (1 + liveChange / 100);
                      const liveValue = stock.shares * livePrice;
                      
                      return (
                        <tr
                          key={idx}
                          className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedPosition({...stock, value: liveValue})}
                        >
                          <td className="p-4">{stock.name}</td>
                          <td className="p-4 font-mono">{stock.ticker}</td>
                          <td className="p-4 text-right">{stock.shares}</td>
                          <td className="p-4 text-right transition-all duration-500">${livePrice.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className={`flex items-center justify-end gap-1 transition-all duration-500 ${liveChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {liveChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {liveChange >= 0 ? '+' : ''}{liveChange.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-4 text-right font-semibold transition-all duration-500">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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
                    {mockData.bonds.map((bond, idx) => {
                      const liveChange = getLiveChange(bond.change);
                      const livePrice = bond.price * (1 + liveChange / 100);
                      const liveValue = bond.units * livePrice;
                      
                      return (
                        <tr
                          key={idx}
                          className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedPosition({...bond, value: liveValue})}
                        >
                          <td className="p-4">{bond.name}</td>
                          <td className="p-4 font-mono">{bond.ticker}</td>
                          <td className="p-4 text-right">{bond.units}</td>
                          <td className="p-4 text-right transition-all duration-500">${livePrice.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className={`flex items-center justify-end gap-1 transition-all duration-500 ${liveChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {liveChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {liveChange >= 0 ? '+' : ''}{liveChange.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-4 text-right font-semibold transition-all duration-500">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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
                    {mockData.funds.map((fund, idx) => {
                      const liveChange = getLiveChange(fund.change);
                      const livePrice = fund.price * (1 + liveChange / 100);
                      const liveValue = fund.shares * livePrice;
                      
                      return (
                        <tr
                          key={idx}
                          className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedPosition({...fund, value: liveValue})}
                        >
                          <td className="p-4">{fund.name}</td>
                          <td className="p-4 font-mono">{fund.ticker}</td>
                          <td className="p-4 text-right">{fund.shares}</td>
                          <td className="p-4 text-right transition-all duration-500">${livePrice.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className={`flex items-center justify-end gap-1 transition-all duration-500 ${liveChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {liveChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {liveChange >= 0 ? '+' : ''}{liveChange.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-4 text-right font-semibold transition-all duration-500">${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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
                    {mockData.cds.map((cd, idx) => (
                      <tr
                        key={idx}
                        className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedPosition(cd)}
                      >
                        <td className="p-4">{cd.name}</td>
                        <td className="p-4">{cd.institution}</td>
                        <td className="p-4 text-right">${cd.principal.toLocaleString()}</td>
                        <td className="p-4 text-right">{cd.rate.toFixed(2)}%</td>
                        <td className="p-4">{cd.maturity}</td>
                        <td className="p-4 text-right font-semibold">${cd.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

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
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold text-accent">${selectedPosition.value?.toLocaleString()}</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

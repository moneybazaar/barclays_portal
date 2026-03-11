import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHoldings } from "@/hooks/useHoldings";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#00A9E0", "#005EB8", "#FFB81C", "#002B5C"];
const ASSET_LABELS: Record<string, string> = {
  stock: "Equities",
  bond: "Fixed Income",
  fund: "Funds",
  cd: "Cash & CDs",
};

const Dashboard = () => {
  const { user, loading, username, userRole, signOut } = useAuth();
  const { holdings, totalValue, loading: holdingsLoading } = useHoldings();
  const [adminStats, setAdminStats] = useState<{ totalClients: number; totalAum: number; totalPositions: number } | null>(null);

  useEffect(() => {
    if (userRole === "admin") {
      const token = localStorage.getItem("barclays_session_token");
      if (!token) return;
      supabase.functions.invoke("admin-clients", {
        body: { session_token: token, action: "get-stats" },
      }).then(({ data }) => {
        if (data && !data.error) setAdminStats(data);
      });
    }
  }, [userRole]);

  // Compute portfolio metrics from real holdings
  const { assetAllocation, portfolioGrowth, positions, totalPL, plPercent } = useMemo(() => {
    if (!holdings.length) return { assetAllocation: [], portfolioGrowth: [], positions: [], totalPL: 0, plPercent: 0 };

    // Asset allocation
    const typeMap: Record<string, number> = {};
    let totalCost = 0;
    holdings.forEach(h => {
      const qty = Number(h.shares || h.units || h.principal || 0);
      const val = qty * Number(h.current_price);
      const cost = qty * Number(h.purchase_price);
      typeMap[h.asset_type] = (typeMap[h.asset_type] || 0) + val;
      totalCost += cost;
    });

    const assetAllocation = Object.entries(typeMap).map(([type, value]) => ({
      name: ASSET_LABELS[type] || type,
      value: Math.round(value),
    }));

    // Portfolio growth from holdings created_at dates
    const sorted = [...holdings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let cumulative = 0;
    const growthMap: Record<string, number> = {};
    sorted.forEach(h => {
      const qty = Number(h.shares || h.units || h.principal || 0);
      cumulative += qty * Number(h.current_price);
      const month = new Date(h.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      growthMap[month] = cumulative;
    });
    const portfolioGrowth = Object.entries(growthMap).map(([month, value]) => ({ month, value }));

    // Positions table grouped by asset type
    const posMap: Record<string, { value: number; cost: number; count: number }> = {};
    holdings.forEach(h => {
      const qty = Number(h.shares || h.units || h.principal || 0);
      const val = qty * Number(h.current_price);
      const cost = qty * Number(h.purchase_price);
      if (!posMap[h.asset_type]) posMap[h.asset_type] = { value: 0, cost: 0, count: 0 };
      posMap[h.asset_type].value += val;
      posMap[h.asset_type].cost += cost;
      posMap[h.asset_type].count += 1;
    });
    const positions = Object.entries(posMap).map(([type, data]) => ({
      name: ASSET_LABELS[type] || type,
      type,
      value: data.value,
      cost: data.cost,
      count: data.count,
      change: data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0,
    }));

    const totalPL = totalValue - totalCost;
    const plPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

    return { assetAllocation, portfolioGrowth, positions, totalPL, plPercent };
  }, [holdings, totalValue]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatAum = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    return formatCurrency(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {userRole === "admin" ? "Admin Portal" : "Portfolio Overview"}
              </h1>
              {userRole === "admin" && <Badge variant="destructive">Admin</Badge>}
            </div>
            <p className="text-muted-foreground">
              {userRole === "admin"
                ? `Welcome, ${username}. You have full administrative access.`
                : `Welcome back, ${username}`}
            </p>
          </div>

          {userRole === "admin" && (
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-accent/10 rounded-lg border-2 border-accent/30">
              <Card className="shadow-md border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold">
                        {adminStats ? adminStats.totalClients : <Loader2 className="h-5 w-5 animate-spin" />}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total AUM</p>
                      <p className="text-2xl font-bold">
                        {adminStats ? formatAum(adminStats.totalAum) : <Loader2 className="h-5 w-5 animate-spin" />}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Positions</p>
                      <p className="text-2xl font-bold">
                        {adminStats ? adminStats.totalPositions : <Loader2 className="h-5 w-5 animate-spin" />}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {userRole !== "admin" && (
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0 shadow-md">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Welcome back, {username}!</h2>
                    <p className="text-muted-foreground mt-1">Your portfolio is performing well. Here's your personalized overview.</p>
                  </div>
                  <Link to="/investments">
                    <Button>View Investments</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {holdingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{formatCurrency(totalValue)}</div>
                    <p className={`text-sm mt-2 font-medium ${plPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(1)}% Overall
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Unrealized gains</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{holdings.length}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Across {new Set(holdings.map(h => h.asset_type)).size} asset classes
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Asset Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{assetAllocation.length}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {assetAllocation.map(a => a.name).join(", ") || "None"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Portfolio Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioGrowth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={portfolioGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                          <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No holdings data yet. Add investments to see growth.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Asset Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {assetAllocation.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={assetAllocation}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {assetAllocation.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No holdings data yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle className="text-xl font-bold">Investment Positions</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Portfolio holdings by asset class</p>
                  </div>
                  <Link to="/investments">
                    <Button variant="link" className="gap-1 text-accent">View Details →</Button>
                  </Link>
                </CardHeader>
                <CardContent className="pt-6">
                  {positions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            <th className="pb-4">Asset Class</th>
                            <th className="pb-4 text-right">Holdings</th>
                            <th className="pb-4 text-right">Cost Basis</th>
                            <th className="pb-4 text-right">Current Value</th>
                            <th className="pb-4 text-right">Change %</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {positions.map((pos) => (
                            <tr key={pos.type} className="border-b hover:bg-accent/5 transition-colors">
                              <td className="py-4 font-semibold text-foreground">{pos.name}</td>
                              <td className="py-4 text-right">{pos.count}</td>
                              <td className="py-4 text-right">{formatCurrency(pos.cost)}</td>
                              <td className="py-4 text-right font-medium">{formatCurrency(pos.value)}</td>
                              <td className={`py-4 text-right font-bold ${pos.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {pos.change >= 0 ? '+' : ''}{pos.change.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td className="py-4">Total</td>
                            <td className="py-4 text-right">{holdings.length}</td>
                            <td className="py-4 text-right">{formatCurrency(positions.reduce((s, p) => s + p.cost, 0))}</td>
                            <td className="py-4 text-right">{formatCurrency(totalValue)}</td>
                            <td className={`py-4 text-right ${plPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(1)}%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No holdings yet. Visit <Link to="/investments" className="text-accent underline">Investments</Link> to add positions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

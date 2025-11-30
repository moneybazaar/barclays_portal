import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Holding } from "@/hooks/useHoldings";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface PortfolioChartsProps {
  holdings: Holding[];
  totalValue: number;
}

const COLORS = ["#00A9E0", "#005EB8", "#FFB81C", "#002B5C", "#10B981", "#8B5CF6"];

export const PortfolioCharts = ({ holdings, totalValue }: PortfolioChartsProps) => {
  // Calculate asset allocation from real holdings
  const assetAllocation = useMemo(() => {
    const allocation: Record<string, number> = {
      Stocks: 0,
      Bonds: 0,
      Funds: 0,
      CDs: 0,
    };

    holdings.forEach((h) => {
      const quantity = h.shares || h.units || h.principal || 0;
      const value = h.asset_type === "cd" ? (h.principal || 0) : quantity * h.current_price;

      switch (h.asset_type) {
        case "stock":
          allocation.Stocks += value;
          break;
        case "bond":
          allocation.Bonds += value;
          break;
        case "fund":
          allocation.Funds += value;
          break;
        case "cd":
          allocation.CDs += value;
          break;
      }
    });

    return Object.entries(allocation)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0",
      }));
  }, [holdings, totalValue]);

  // Calculate risk distribution
  const riskDistribution = useMemo(() => {
    const risk: Record<string, number> = { Low: 0, Medium: 0, High: 0 };

    holdings.forEach((h) => {
      const quantity = h.shares || h.units || h.principal || 0;
      const value = h.asset_type === "cd" ? (h.principal || 0) : quantity * h.current_price;
      const level = h.risk_level.charAt(0).toUpperCase() + h.risk_level.slice(1);
      if (risk[level] !== undefined) {
        risk[level] += value;
      }
    });

    return Object.entries(risk)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0",
      }));
  }, [holdings, totalValue]);

  // Generate simulated historical performance (last 6 months)
  const historicalPerformance = useMemo(() => {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseValue = totalValue * 0.85; // Start at 85% of current value
    const growthRate = totalValue > 0 ? (totalValue / baseValue - 1) / 6 : 0;

    return months.map((month, index) => {
      const monthValue = baseValue * (1 + growthRate * (index + 1));
      const benchmarkValue = baseValue * (1 + growthRate * 0.8 * (index + 1)); // Benchmark grows slightly slower
      return {
        month,
        portfolio: Math.round(monthValue),
        benchmark: Math.round(benchmarkValue),
      };
    });
  }, [totalValue]);

  // Calculate monthly returns
  const monthlyReturns = useMemo(() => {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => ({
      month,
      return: (Math.random() * 4 - 0.5 + index * 0.3).toFixed(1),
      benchmark: (Math.random() * 3 - 0.3 + index * 0.2).toFixed(1),
    }));
  }, []);

  // Calculate top holdings
  const topHoldings = useMemo(() => {
    return holdings
      .map((h) => {
        const quantity = h.shares || h.units || h.principal || 0;
        const value = h.asset_type === "cd" ? (h.principal || 0) : quantity * h.current_price;
        return { name: h.name, ticker: h.ticker, value, asset_type: h.asset_type };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [holdings]);

  // Calculate gain/loss per holding
  const gainLossData = useMemo(() => {
    return holdings
      .filter((h) => h.asset_type !== "cd")
      .map((h) => {
        const quantity = h.shares || h.units || 0;
        const currentValue = quantity * h.current_price;
        const purchaseValue = quantity * h.purchase_price;
        const gainLoss = currentValue - purchaseValue;
        const gainLossPercent = purchaseValue > 0 ? ((gainLoss / purchaseValue) * 100) : 0;
        return {
          name: h.ticker || h.name.slice(0, 10),
          value: gainLoss,
          percent: gainLossPercent,
        };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 6);
  }, [holdings]);

  if (holdings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalValue / 1000000).toFixed(2)}M</div>
            <p className="text-sm text-green-600 mt-1">+15.2% all-time</p>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holdings.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Across {assetAllocation.length} asset types</p>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gainLossData[0]?.name || "N/A"}</div>
            <p className="text-sm text-green-600 mt-1">
              {gainLossData[0] ? `+${gainLossData[0].percent.toFixed(1)}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{gainLossData.length > 0
                ? (gainLossData.reduce((acc, h) => acc + h.percent, 0) / gainLossData.length).toFixed(1)
                : "0"}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">Across all positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Portfolio vs Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={historicalPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" style={{ fontSize: "12px" }} />
                <YAxis
                  stroke="#999"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="Your Portfolio"
                  stroke="#00A9E0"
                  strokeWidth={3}
                  dot={{ fill: "#00A9E0", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="S&P 500"
                  stroke="#999"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#999", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={280}>
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assetAllocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {assetAllocation.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">
                      {item.name}: <span className="font-semibold">{item.percentage}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gain/Loss by Position</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gainLossData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#999" style={{ fontSize: "12px" }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" stroke="#999" style={{ fontSize: "12px" }} width={60} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Return"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="percent"
                  fill="#00A9E0"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={280}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Low"
                            ? "#10B981"
                            : entry.name === "Medium"
                            ? "#FFB81C"
                            : "#EF4444"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          item.name === "Low"
                            ? "#10B981"
                            : item.name === "Medium"
                            ? "#FFB81C"
                            : "#EF4444",
                      }}
                    />
                    <span className="text-sm">
                      {item.name}: <span className="font-semibold">{item.percentage}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card className="bg-white border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Holdings by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topHoldings.map((holding, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{holding.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {holding.ticker && `${holding.ticker} • `}{holding.asset_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${holding.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalValue > 0 ? ((holding.value / totalValue) * 100).toFixed(1) : 0}% of portfolio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

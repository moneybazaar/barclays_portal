import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { AiMarketAnalysis } from "@/components/AiMarketAnalysis";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

// Mock data for Top Picks bubble chart
const topPicksData = [
  { name: "Tech A", marketCap: 850, appreciation: 15, sector: "Technology" },
  { name: "Tech B", marketCap: 620, appreciation: 22, sector: "Technology" },
  { name: "Tech C", marketCap: 450, appreciation: 18, sector: "Technology" },
  { name: "Finance A", marketCap: 720, appreciation: 8, sector: "Financials" },
  { name: "Finance B", marketCap: 580, appreciation: 12, sector: "Financials" },
  { name: "Energy A", marketCap: 690, appreciation: 25, sector: "Energy" },
  { name: "Energy B", marketCap: 520, appreciation: 28, sector: "Energy" },
  { name: "Health A", marketCap: 480, appreciation: 35, sector: "Healthcare" },
  { name: "Health B", marketCap: 420, appreciation: 42, sector: "Healthcare" },
  { name: "Consumer A", marketCap: 380, appreciation: 48, sector: "Consumer" },
];

// Mock time series data for macro charts
const macroTimeSeriesData = [
  { date: "Jul 16", series1: 1.2, series2: 1.4, series3: 1.25 },
  { date: "Aug 16", series1: 1.25, series2: 1.42, series3: 1.28 },
  { date: "Sep 16", series1: 1.28, series2: 1.5, series3: 1.32 },
  { date: "Oct 16", series1: 1.35, series2: 1.58, series3: 1.38 },
  { date: "Nov 16", series1: 1.42, series2: 1.72, series3: 1.45 },
  { date: "Dec 16", series1: 1.48, series2: 1.85, series3: 1.52 },
  { date: "Jan 17", series1: 1.55, series2: 1.95, series3: 1.58 },
  { date: "Feb 17", series1: 1.62, series2: 2.08, series3: 1.65 },
  { date: "Mar 17", series1: 1.68, series2: 2.15, series3: 1.68 },
  { date: "Apr 17", series1: 1.72, series2: 2.18, series3: 1.70 },
  { date: "May 17", series1: 1.75, series2: 2.12, series3: 1.72 },
  { date: "Jun 17", series1: 1.78, series2: 1.98, series3: 1.75 },
];

// FX Heatmap data
const fxPairs = [
  ["HUF/PLN", "USD/BRL", "EUR/KRW", "EUR/GBP", "GBP/AUD", "EUR/HUF"],
  ["EUR/JPY", "EUR/PLN", "AUD/CHF", "EUR/PHP", "USD/CZK", "EUR/USD"],
  ["USD/TWD", "USD/MYR", "AUD/JPY", "NZD/JPY", "EUR/ZAR", "GBP/PLN"],
  ["USD/PLN", "EUR/TWD", "USD/SGD", "TRY/JPY", "AUD/NZD", "GBP/BRL"],
  ["USD/PHP", "GBP/ZAR", "AUD/USD", "USD/CLP", "SGD/JPY", "EUR/MYR"],
];

const fxValues = [
  [0.2, -0.3, 0.5, 0.1, -0.2, 0.4],
  [0.3, 0.2, -0.1, 0.2, 0.1, 0.3],
  [-0.2, -0.1, 0.2, -0.3, 0.4, 0.1],
  [0.1, 0.3, 0.2, -0.2, 0.3, 0.2],
  [-0.1, 0.2, -0.2, 0.1, 0.3, -0.3],
];

const sectorColors: Record<string, string> = {
  Technology: "hsl(195, 100%, 47%)",
  Financials: "hsl(45, 100%, 50%)",
  Energy: "hsl(25, 100%, 50%)",
  Healthcare: "hsl(280, 60%, 50%)",
  Consumer: "hsl(210, 60%, 50%)",
};

export default function Research() {
  const { user, loading, username, userRole } = useAuth();
  const [viewMode, setViewMode] = useState<"chart" | "table" | "publications">("chart");
  const [region, setRegion] = useState<"regional" | "sector">("regional");
  const [timePeriod, setTimePeriod] = useState<"3m" | "6m" | "ytd" | "1y">("ytd");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    toast({
      title: "Download Started",
      description: "Research report PDF is being generated...",
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-elevated">
          <p className="font-semibold text-sm">{payload[0].payload.name}</p>
          <p className="text-xs text-muted-foreground">
            Market Cap: ${payload[0].payload.marketCap}B
          </p>
          <p className="text-xs text-green-600 font-semibold">
            Price Appreciation: +{payload[0].payload.appreciation}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getHeatmapColor = (value: number) => {
    if (value > 0.2) return "bg-green-200 text-green-900";
    if (value > 0) return "bg-green-50 text-green-800";
    if (value > -0.2) return "bg-red-50 text-red-800";
    return "bg-red-200 text-red-900";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DashboardNav username={username} userRole={userRole} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-accent">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Top Picks</h1>
              <p className="text-sm text-muted-foreground">
                Barclays Equity Research's "Top Picks" represent the single best alpha-generating investment idea within each industry
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="ytd">YTD</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Financials">Financials</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Consumer">Consumer</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search picks" className="pl-10 w-48" />
              </div>
              <Link to="/fx-heatmap">
                <Button variant="outline" size="sm">
                  FX Heatmap
                </Button>
              </Link>
              <Button onClick={handleDownloadPDF} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="chart" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:bg-transparent px-6 py-3"
              >
                <span className="font-semibold">Interactive Chart</span>
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:bg-transparent px-6 py-3"
              >
                <span className="font-semibold">Table</span>
              </TabsTrigger>
              <TabsTrigger 
                value="publications" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:bg-transparent px-6 py-3"
              >
                <span className="font-semibold">Publications</span>
              </TabsTrigger>
            </TabsList>

            {/* Interactive Chart View */}
            <TabsContent value="chart" className="mt-6 space-y-6">
              {/* AI Market Analysis */}
              <AiMarketAnalysis fxData={fxValues} timePeriod={timePeriod} />

              {/* Region/Sector Toggle */}
              <div className="flex gap-3">
                <Button
                  variant={region === "regional" ? "default" : "outline"}
                  onClick={() => setRegion("regional")}
                  className="rounded-sm"
                >
                  Regional Breakout
                </Button>
                <Button
                  variant={region === "sector" ? "default" : "outline"}
                  onClick={() => setRegion("sector")}
                  className="rounded-sm"
                >
                  Sector Breakout
                </Button>
              </div>

              {/* Bubble Chart Card */}
              <Card className="shadow-elevated">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-primary">Top Picks Analysis</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total Price Appreciation (%) - Circle size reflects relative Market Cap
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        dataKey="appreciation" 
                        name="Price Appreciation"
                        unit="%"
                        domain={[0, 60]}
                        label={{ value: 'Total Price Appreciation (%)', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis type="number" dataKey="marketCap" name="Market Cap" unit="B" hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter name="Top Picks" data={topPicksData}>
                        {topPicksData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={sectorColors[entry.sector]} opacity={0.8} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-6 justify-center mt-6">
                    {Object.entries(sectorColors).map(([sector, color]) => (
                      <div key={sector} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium">{sector}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Macro Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-elevated">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-bold">Macro Chart - Time Series</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={macroTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="series1" 
                          stroke="hsl(195, 100%, 47%)" 
                          strokeWidth={2}
                          dot={false}
                          name="Series 1"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="series2" 
                          stroke="hsl(220, 39%, 11%)" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Series 2"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="series3" 
                          stroke="hsl(210, 60%, 50%)" 
                          strokeWidth={2}
                          dot={false}
                          name="Series 3"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-elevated">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-bold">Performance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topPicksData.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appreciation" name="Price Appreciation %">
                          {topPicksData.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={sectorColors[entry.sector]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* FX Heatmap */}
              <Card className="shadow-elevated">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-bold">Foreign Exchange - Heatmap</CardTitle>
                  <p className="text-sm text-muted-foreground">Moving Average 1: period - 21 days</p>
                </CardHeader>
                <CardContent className="p-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {fxPairs.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((pair, colIndex) => (
                            <td
                              key={colIndex}
                              className={`p-3 text-center text-sm font-semibold border ${getHeatmapColor(
                                fxValues[rowIndex][colIndex]
                              )}`}
                            >
                              {pair}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Table View */}
            <TabsContent value="table" className="mt-6">
              <Card className="shadow-elevated">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-primary">
                          <th className="text-left p-3 font-bold text-sm">Symbol</th>
                          <th className="text-left p-3 font-bold text-sm">Company</th>
                          <th className="text-right p-3 font-bold text-sm">Sector</th>
                          <th className="text-right p-3 font-bold text-sm">Market Cap ($B)</th>
                          <th className="text-right p-3 font-bold text-sm">Price Appreciation</th>
                          <th className="text-right p-3 font-bold text-sm">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPicksData.map((pick, idx) => (
                          <tr key={idx} className="border-b hover:bg-accent/5 transition-colors">
                            <td className="p-3 font-mono text-sm">{pick.name.split(' ')[0]}</td>
                            <td className="p-3 text-sm font-medium">{pick.name}</td>
                            <td className="p-3 text-right text-sm">{pick.sector}</td>
                            <td className="p-3 text-right text-sm font-semibold">${pick.marketCap}</td>
                            <td className="p-3 text-right text-sm font-bold text-green-600">
                              +{pick.appreciation}%
                            </td>
                            <td className="p-3 text-right">
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                Overweight
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Publications View */}
            <TabsContent value="publications" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Q1 2026 Global Outlook", date: "Jan 15, 2026", type: "Research Report" },
                  { title: "Top Picks Monthly Update", date: "Jan 10, 2026", type: "Market Update" },
                  { title: "Sector Analysis: Technology", date: "Jan 5, 2026", type: "Sector Report" },
                  { title: "FX Market Trends", date: "Jan 3, 2026", type: "Market Analysis" },
                ].map((pub, idx) => (
                  <Card key={idx} className="shadow-elevated hover:shadow-elevated transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded">
                          {pub.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{pub.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Comprehensive analysis and insights from Barclays Research team
                      </p>
                      <Button variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                        Read Full Report →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

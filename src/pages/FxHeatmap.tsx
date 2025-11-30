import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";

// Extended FX Pairs data
const fxPairs = [
  ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP"],
  ["EUR/JPY", "GBP/JPY", "AUD/JPY", "NZD/JPY", "CAD/JPY", "CHF/JPY", "USD/CNY", "EUR/CHF"],
  ["EUR/AUD", "GBP/AUD", "USD/SGD", "EUR/NZD", "GBP/NZD", "USD/MXN", "EUR/CAD", "GBP/CAD"],
  ["USD/ZAR", "EUR/SEK", "USD/NOK", "USD/DKK", "EUR/NOK", "GBP/SEK", "USD/TRY", "EUR/TRY"],
  ["USD/BRL", "USD/INR", "USD/KRW", "USD/THB", "USD/MYR", "USD/PHP", "USD/IDR", "EUR/PLN"],
  ["GBP/PLN", "USD/CZK", "EUR/HUF", "USD/ILS", "EUR/RUB", "USD/ARS", "USD/CLP", "EUR/ZAR"],
];

// Generate realistic FX values
const generateFxValues = () => {
  return fxPairs.map(row => 
    row.map(() => (Math.random() - 0.5) * 1.2)
  );
};

export default function FxHeatmap() {
  const { user, loading, username, userRole } = useAuth();
  const [fxValues, setFxValues] = useState(generateFxValues());
  const [timePeriod, setTimePeriod] = useState("21");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getHeatmapColor = (value: number) => {
    if (value > 0.4) return "bg-green-600 text-white";
    if (value > 0.2) return "bg-green-400 text-green-900";
    if (value > 0) return "bg-green-100 text-green-800";
    if (value > -0.2) return "bg-red-100 text-red-800";
    if (value > -0.4) return "bg-red-400 text-red-900";
    return "bg-red-600 text-white";
  };

  const handleRefresh = () => {
    setFxValues(generateFxValues());
    setLastUpdated(new Date());
    toast({
      title: "Data Refreshed",
      description: "FX heatmap updated with latest data",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "FX heatmap data is being exported...",
    });
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
              <h1 className="text-4xl font-bold text-primary mb-2">FX Trading Heatmap</h1>
              <p className="text-sm text-muted-foreground">
                Real-time currency pair performance analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days MA</SelectItem>
                  <SelectItem value="14">14 Days MA</SelectItem>
                  <SelectItem value="21">21 Days MA</SelectItem>
                  <SelectItem value="50">50 Days MA</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefresh} size="sm" variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExport} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Info Bar */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Moving Average Period: {timePeriod} days</p>
              <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-xs">Strong Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border"></div>
                <span className="text-xs">Weak Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded border"></div>
                <span className="text-xs">Weak Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-xs">Strong Negative</span>
              </div>
            </div>
          </div>

          {/* FX Heatmap */}
          <Card className="shadow-elevated">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold text-primary">Currency Pairs Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Percentage change over {timePeriod} day moving average
              </p>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {fxPairs.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((pair, colIndex) => (
                        <td
                          key={colIndex}
                          className={`p-4 text-center text-sm font-semibold border transition-colors hover:opacity-80 cursor-pointer ${getHeatmapColor(
                            fxValues[rowIndex][colIndex]
                          )}`}
                          title={`${pair}: ${(fxValues[rowIndex][colIndex] * 100).toFixed(2)}%`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold">{pair}</span>
                            <span className="text-xs mt-1">
                              {fxValues[rowIndex][colIndex] >= 0 ? '+' : ''}
                              {(fxValues[rowIndex][colIndex] * 100).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Top Movers Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-bold text-green-600">Top Gainers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { pair: "EUR/USD", change: 0.82 },
                    { pair: "GBP/USD", change: 0.65 },
                    { pair: "AUD/JPY", change: 0.58 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span className="font-semibold">{item.pair}</span>
                      <span className="text-green-600 font-bold">+{(item.change * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-bold text-red-600">Top Losers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { pair: "USD/JPY", change: -0.75 },
                    { pair: "EUR/GBP", change: -0.62 },
                    { pair: "USD/CHF", change: -0.48 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded">
                      <span className="font-semibold">{item.pair}</span>
                      <span className="text-red-600 font-bold">{(item.change * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

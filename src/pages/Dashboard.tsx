import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Settings, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const portfolioData = [
  { month: "Jan", value: 245000 },
  { month: "Feb", value: 268000 },
  { month: "Mar", value: 285000 },
  { month: "Apr", value: 295000 },
  { month: "May", value: 310000 },
  { month: "Jun", value: 338000 },
];

const performanceData = [
  { month: "Jan", portfolio: 2.3, benchmark: 1.8 },
  { month: "Feb", portfolio: 3.1, benchmark: 2.5 },
  { month: "Mar", portfolio: 2.8, benchmark: 2.2 },
  { month: "Apr", portfolio: 3.5, benchmark: 2.9 },
  { month: "May", portfolio: 4.2, benchmark: 3.4 },
  { month: "Jun", portfolio: 4.8, benchmark: 3.8 },
];

const assetAllocation = [
  { name: "Equities", value: 45 },
  { name: "Fixed Income", value: 30 },
  { name: "Alternatives", value: 15 },
  { name: "Cash", value: 10 },
];

const COLORS = ["#00A9E0", "#005EB8", "#FFB81C", "#002B5C"];

const Dashboard = () => {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "ytd">("ytd");
  const [liveUpdate, setLiveUpdate] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(12.45);
  const [monthlyReturn, setMonthlyReturn] = useState(4.8);
  const [cashAvailable, setCashAvailable] = useState(1.24);

  // Real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdate(prev => prev + 1);
      // Simulate small market fluctuations (-0.5% to +0.5%)
      setPortfolioValue(prev => prev + (Math.random() - 0.5) * 0.06);
      setMonthlyReturn(prev => prev + (Math.random() - 0.5) * 0.2);
      setCashAvailable(prev => prev + (Math.random() - 0.5) * 0.01);
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

  const positions = [
    { 
      activity: "Global Equity Fund", 
      investmentSize: 2450000, 
      stocks: 1200000, 
      bonds: 650000, 
      funds: 400000, 
      cds: 200000, 
      change: 9.4 
    },
    { 
      activity: "Fixed Income Fund", 
      investmentSize: 1250000, 
      stocks: 300000, 
      bonds: 550000, 
      funds: 250000, 
      cds: 150000, 
      change: 2.8 
    },
    { 
      activity: "Alternative Assets", 
      investmentSize: 850000, 
      stocks: 400000, 
      bonds: 200000, 
      funds: 150000, 
      cds: 100000, 
      change: 7.3 
    },
    { 
      activity: "Private Equity", 
      investmentSize: 500000, 
      stocks: 250000, 
      bonds: 100000, 
      funds: 100000, 
      cds: 50000, 
      change: -4.4 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                {userRole === "admin" ? "Admin Portal" : "Portfolio Overview"}
              </h1>
              <Badge variant="outline" className="gap-2 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Live
              </Badge>
              {userRole === "admin" && (
                <Badge variant="destructive">Admin</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {userRole === "admin" 
                ? `Welcome, ${username}. You have full administrative access.`
                : `Welcome back, ${username}`
              }
            </p>
          </div>

          {userRole === "admin" && (
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-accent/10 rounded-lg border-2 border-accent/30">
              <Card className="shadow-md bg-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md bg-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total AUM</p>
                      <p className="text-2xl font-bold">£2.4B</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md bg-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Orders</p>
                      <p className="text-2xl font-bold">342</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md bg-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">System Status</p>
                      <p className="text-2xl font-bold text-green-600">Healthy</p>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-500">
                  ${portfolioValue.toFixed(2)}M
                </div>
                <p className="text-sm text-green-600 mt-2 font-medium">+12.5% YTD</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-500">
                  ${cashAvailable.toFixed(2)}M
                </div>
                <p className="text-sm text-muted-foreground mt-2">Ready to invest</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground transition-all duration-500">
                  +{monthlyReturn.toFixed(1)}%
                </div>
                <p className="text-sm text-green-600 mt-2 font-medium">+1.2% vs benchmark</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">24</div>
                <p className="text-sm text-muted-foreground mt-2">Across 6 asset classes</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Portfolio Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#00A9E0" strokeWidth={3} dot={{ fill: '#00A9E0', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Performance vs Benchmark</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="portfolio" fill="#00A9E0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="benchmark" fill="#005EB8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Investment Positions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Real-time overview of your portfolio holdings</p>
              </div>
              <div className="flex items-center gap-4">
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                  <TabsList className="bg-muted">
                    <TabsTrigger value="3m">3M</TabsTrigger>
                    <TabsTrigger value="6m">6M</TabsTrigger>
                    <TabsTrigger value="ytd">YTD</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Link to="/research">
                  <Button variant="link" className="gap-1 text-accent">
                    View Details →
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <th className="pb-4">Activity</th>
                      <th className="pb-4 text-right">Investment Size ($)</th>
                      <th className="pb-4 text-right">Stocks</th>
                      <th className="pb-4 text-right">Bonds</th>
                      <th className="pb-4 text-right">Funds</th>
                      <th className="pb-4 text-right">CDs</th>
                      <th className="pb-4 text-right">Change %</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {positions.map((pos, idx) => {
                      // Add small random fluctuations to simulate live updates
                      const liveChange = pos.change + (Math.random() - 0.5) * 0.5;
                      const liveValue = pos.investmentSize * (1 + liveChange / 100);
                      
                      return (
                        <tr key={idx} className="border-b hover:bg-accent/5 transition-colors">
                          <td className="py-4 font-semibold text-foreground">{pos.activity}</td>
                          <td className="py-4 text-right font-medium transition-all duration-500">
                            ${liveValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-4 text-right">${pos.stocks.toLocaleString()}</td>
                          <td className="py-4 text-right">${pos.bonds.toLocaleString()}</td>
                          <td className="py-4 text-right">${pos.funds.toLocaleString()}</td>
                          <td className="py-4 text-right">${pos.cds.toLocaleString()}</td>
                          <td className={`py-4 text-right font-bold transition-all duration-500 ${liveChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {liveChange >= 0 ? '+' : ''}{liveChange.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <CardTitle>Mandates Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Active</span>
                    <Badge variant="default">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Under Review</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Closed</span>
                    <Badge variant="outline">23</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-2 w-2 rounded-full bg-accent mt-1.5" />
                    <div>
                      <p className="font-medium">Capital call processed</p>
                      <p className="text-xs text-muted-foreground">PE Fund I - £250,000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-2 w-2 rounded-full bg-green-600 mt-1.5" />
                    <div>
                      <p className="font-medium">Distribution received</p>
                      <p className="text-xs text-muted-foreground">Credit Fund II - £85,000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1.5" />
                    <div>
                      <p className="font-medium">Quarterly report available</p>
                      <p className="text-xs text-muted-foreground">Q4 2024 Performance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

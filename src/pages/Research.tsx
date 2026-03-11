import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { AiMarketAnalysis } from "@/components/AiMarketAnalysis";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// FX Heatmap data (static grid for display)
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

interface ResearchPost {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
}

export default function Research() {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<"chart" | "publications">("publications");
  const [posts, setPosts] = useState<ResearchPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("barclays_session_token");
      if (!token) { setPostsLoading(false); return; }
      try {
        const { data } = await supabase.functions.invoke("admin-clients", {
          body: { session_token: token, action: "list-research" },
        });
        setPosts(data?.posts || []);
      } catch { /* ignore */ }
      setPostsLoading(false);
    };
    if (!loading) fetchPosts();
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getHeatmapColor = (value: number) => {
    if (value > 0.2) return "bg-green-200 text-green-900";
    if (value > 0) return "bg-green-50 text-green-800";
    if (value > -0.2) return "bg-red-50 text-red-800";
    return "bg-red-200 text-red-900";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-accent">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Research & Insights</h1>
              <p className="text-sm text-muted-foreground">Published research and market analysis from our team</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/fx-heatmap">
                <Button variant="outline" size="sm">FX Heatmap</Button>
              </Link>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
            <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="publications" className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:bg-transparent px-6 py-3">
                <span className="font-semibold">Publications</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none data-[state=active]:bg-transparent px-6 py-3">
                <span className="font-semibold">AI Analysis</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publications" className="mt-6">
              {postsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : posts.length === 0 ? (
                <Card className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">No Research Published</h3>
                  <p className="text-muted-foreground">Research publications will appear here once published by the team.</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded">Research</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.published_at || post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                        {post.summary && <p className="text-sm text-muted-foreground mb-3">{post.summary}</p>}
                        {post.author && <p className="text-xs text-muted-foreground">By {post.author}</p>}
                        {post.content && (
                          <div className="mt-4 pt-4 border-t text-sm text-foreground whitespace-pre-wrap">
                            {post.content.substring(0, 300)}{post.content.length > 300 ? "..." : ""}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chart" className="mt-6 space-y-6">
              <AiMarketAnalysis fxData={fxValues} timePeriod="ytd" />

              <Card className="shadow-md">
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
                            <td key={colIndex} className={`p-3 text-center text-sm font-semibold border ${getHeatmapColor(fxValues[rowIndex][colIndex])}`}>
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, Shield, UserRoundCog, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RoleManagement } from "@/components/RoleManagement";
import { ClientManagement } from "@/components/ClientManagement";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalClients: number;
  totalAum: number;
  totalPositions: number;
}

export default function BackOffice() {
  const { userRole, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const sessionToken = localStorage.getItem("barclays_session_token");
      if (!sessionToken) return;
      try {
        const { data, error } = await supabase.functions.invoke("admin-clients", {
          body: { session_token: sessionToken, action: "get-stats" },
        });
        if (!error && !data?.error) {
          setStats(data);
        }
      } catch { /* ignore */ }
      setStatsLoading(false);
    };
    if (userRole === "admin") fetchStats();
  }, [userRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatAum = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Back Office Administration</h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-1">
              <UserRoundCog className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.totalClients ?? 0}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Assets Under Management</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-2xl font-bold">{formatAum(stats?.totalAum ?? 0)}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-2xl font-bold">{stats?.totalPositions ?? 0}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <p className="text-sm text-muted-foreground">View all registered clients and manage their holdings</p>
              </CardHeader>
              <CardContent>
                <ClientManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <p className="text-sm text-muted-foreground">Assign and manage user roles</p>
              </CardHeader>
              <CardContent>
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

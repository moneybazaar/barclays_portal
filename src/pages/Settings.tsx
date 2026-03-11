import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Monitor, Moon, Sun, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";

interface AppSession {
  id: string;
  created_at: string;
  expires_at: string;
  token: string;
}

export default function Settings() {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });

  const getToken = () => localStorage.getItem("barclays_session_token");

  useEffect(() => {
    if (user) {
      // Load full profile
      const token = getToken();
      if (!token) return;
      supabase.functions.invoke("update-profile", {
        body: { session_token: token, action: "get-profile" },
      }).then(({ data }) => {
        if (data?.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            company: data.user.company || "",
            address: data.user.address || "",
          });
          setTheme(data.user.theme_preference || "light");
        }
      });

      // Load sessions
      supabase.functions.invoke("update-profile", {
        body: { session_token: token, action: "list-sessions" },
      }).then(({ data }) => {
        if (data?.sessions) setSessions(data.sessions);
        setSessionsLoading(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("update-profile", {
        body: {
          session_token: token,
          action: "update",
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
          theme_preference: theme,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Settings Updated", description: "Your account settings have been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    const token = getToken();
    if (token) {
      await supabase.functions.invoke("update-profile", {
        body: { session_token: token, action: "update", theme_preference: newTheme },
      });
    }
    toast({ title: "Theme Updated", description: `Theme changed to ${newTheme} mode.` });
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const token = getToken();
      if (!token) return;
      const { error } = await supabase.functions.invoke("update-profile", {
        body: { session_token: token, action: "revoke-session", session_id: sessionId },
      });
      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({ title: "Session Revoked" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentToken = getToken();

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} userEmail={user?.email} onSignOut={signOut} />
      <DashboardNav username={username} userRole={userRole} />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <Button onClick={handleSave} className="w-full" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant={theme === "light" ? "default" : "outline"} className="w-full justify-start gap-2" onClick={() => handleThemeChange("light")}>
                    <Sun className="h-4 w-4" /> Light Mode
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} className="w-full justify-start gap-2" onClick={() => handleThemeChange("dark")}>
                    <Moon className="h-4 w-4" /> Dark Mode
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} className="w-full justify-start gap-2" onClick={() => handleThemeChange("system")}>
                    <Monitor className="h-4 w-4" /> System Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active sessions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Session</th>
                        <th className="text-left p-3 font-semibold">Created</th>
                        <th className="text-left p-3 font-semibold">Expires</th>
                        <th className="text-right p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => {
                        const isCurrent = session.token === currentToken;
                        return (
                          <tr key={session.id} className="border-t">
                            <td className="p-3">
                              <span className="font-mono text-sm">{session.token.substring(0, 8)}...</span>
                              {isCurrent && <Badge className="ml-2" variant="secondary">Current</Badge>}
                            </td>
                            <td className="p-3 text-sm">{new Date(session.created_at).toLocaleString()}</td>
                            <td className="p-3 text-sm">{new Date(session.expires_at).toLocaleString()}</td>
                            <td className="p-3 text-right">
                              {!isCurrent && (
                                <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

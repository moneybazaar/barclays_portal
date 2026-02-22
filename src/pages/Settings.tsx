import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Monitor, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { DashboardNav } from "@/components/DashboardNav";

const mockSessions = [
  { ip: "192.168.1.22", device: "Chrome / Windows 10", time: "10:42 AM", location: "London, UK" },
  { ip: "10.0.0.4", device: "Safari / iPhone", time: "08:17 AM", location: "London, UK" },
  { ip: "172.16.0.8", device: "Firefox / macOS", time: "Yesterday", location: "Manchester, UK" },
];

export default function Settings() {
  const { user, loading, username, userRole, signOut } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+44 20 7123 4567",
    address: "123 Financial Street, London EC2A 1AB",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleSave = () => {
    toast({
      title: "Settings Updated",
      description: "Your account settings have been saved successfully.",
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme} mode.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light Mode
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => handleThemeChange("system")}
                  >
                    <Monitor className="h-4 w-4" />
                    System Default
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-semibold">IP Address</th>
                      <th className="text-left p-3 font-semibold">Device</th>
                      <th className="text-left p-3 font-semibold">Location</th>
                      <th className="text-left p-3 font-semibold">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSessions.map((session, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3 font-mono text-sm">{session.ip}</td>
                        <td className="p-3">{session.device}</td>
                        <td className="p-3">{session.location}</td>
                        <td className="p-3">{session.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

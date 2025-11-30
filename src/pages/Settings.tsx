import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Monitor, Moon, Sun } from "lucide-react";

const mockSessions = [
  { ip: "192.168.1.22", device: "Chrome / Windows 10", time: "10:42 AM", location: "London, UK" },
  { ip: "10.0.0.4", device: "Safari / iPhone", time: "08:17 AM", location: "London, UK" },
  { ip: "172.16.0.8", device: "Firefox / macOS", time: "Yesterday", location: "Manchester, UK" },
];

export default function Settings() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [formData, setFormData] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+44 20 7123 4567",
    address: "123 Financial Street, London EC2A 1AB",
  });

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

  return (
    <div className="min-h-screen bg-background p-6">
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
                </div>
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
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SESSION_STORAGE_KEY = "barclays_session_token";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("login", {
        body: { email, password },
      });

      if (error || !data?.success) {
        toast({
          title: "Login Failed",
          description: data?.error || "Invalid email or password",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem(SESSION_STORAGE_KEY, data.session_token);
      localStorage.setItem("barclays_user", JSON.stringify(data.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header bar */}
      <div className="w-full bg-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <img src="/barclays-eagle.svg" alt="" className="h-8 w-8 brightness-0 invert" />
          <span className="text-primary-foreground font-bold text-lg tracking-wide">
            BARCLAYS
          </span>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardHeader className="text-center pb-2">
            <img src="/barclays-eagle.svg" alt="" className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Client Portal Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access your investment portfolio
            </p>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-4 border border-dashed border-muted-foreground/30 rounded-md p-3">
              <Label className="text-xs text-muted-foreground font-medium mb-2 block">
                Quick Login (Testing)
              </Label>
              <Select onValueChange={handleQuickLogin}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a test account…" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_ACCOUNTS.map((a) => (
                    <SelectItem key={a.email} value={a.email}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Protected by Barclays Investment Bank security protocols.
                <br />
                Unauthorised access is prohibited.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="w-full bg-muted px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Barclays Investment Bank. All rights reserved.
        </p>
      </div>
    </div>
  );
}

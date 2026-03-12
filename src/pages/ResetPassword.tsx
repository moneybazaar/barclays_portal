import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-password", {
        body: { action: "reset", token, new_password: password },
      });

      if (error || !data?.success) {
        toast({ title: "Error", description: data?.error || "Failed to reset password", variant: "destructive" });
        return;
      }

      setSuccess(true);
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="w-full bg-primary px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <img src="/barclays-eagle.svg" alt="" className="h-8 w-8 brightness-0 invert" />
            <span className="text-primary-foreground font-bold text-lg tracking-wide">BARCLAYS</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md border-2 shadow-lg">
            <CardContent className="pt-6 text-center">
              <p className="text-destructive font-medium mb-4">Invalid or missing reset token.</p>
              <Button onClick={() => navigate("/login")}>Back to Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full bg-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <img src="/barclays-eagle.svg" alt="" className="h-8 w-8 brightness-0 invert" />
          <span className="text-primary-foreground font-bold text-lg tracking-wide">BARCLAYS</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardHeader className="text-center pb-2">
            <img src="/barclays-eagle.svg" alt="" className="h-12 w-12 mx-auto mb-4" />
            {success ? (
              <>
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <h1 className="text-2xl font-bold text-foreground">Password Reset</h1>
                <p className="text-sm text-muted-foreground mt-1">Your password has been updated successfully.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
              </>
            )}
          </CardHeader>
          <CardContent>
            {success ? (
              <Button className="w-full h-12 text-base font-semibold" onClick={() => navigate("/login")}>
                Back to Login
              </Button>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full bg-muted px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Barclays Investment Bank. All rights reserved.
        </p>
      </div>
    </div>
  );
}

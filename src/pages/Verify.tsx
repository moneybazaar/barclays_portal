import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Verify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const email = localStorage.getItem("pendingEmail");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === "000000") {
      toast({
        title: "Account verified",
        description: "Your account has been successfully verified.",
      });
      localStorage.removeItem("pendingEmail");
      navigate("/login");
    } else {
      toast({
        title: "Invalid code",
        description: "Please enter the correct verification code.",
        variant: "destructive",
      });
    }
  };

  const handleResend = () => {
    toast({
      title: "Code resent",
      description: "A new verification code has been sent to your email.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Log in for the first time</h1>
              <p className="text-muted-foreground">
                An email has been sent to you. Please follow the instructions in the email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="\d{6}"
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Demo: use code <span className="font-mono font-semibold">000000</span>
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Verify Account
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResend}
              >
                Resend Code
              </Button>
            </form>

            <div className="text-sm text-muted-foreground">
              <p>
                If you do not receive an email in the next 15 minutes, please email{" "}
                <a href="mailto:support@aegismarkets.com" className="text-accent hover:underline">
                  support@aegismarkets.com
                </a>{" "}
                or{" "}
                <a href="#" className="text-accent hover:underline">
                  contact us
                </a>{" "}
                for assistance.
              </p>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-accent hover:underline text-sm font-medium">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Verify;

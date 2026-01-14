import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const SESSION_STORAGE_KEY = "barclays_session_token";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const email = searchParams.get("email");
      const redirectTo = searchParams.get("redirect_to") || "/dashboard";

      if (!code || !email) {
        setError("Missing authentication parameters");
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("auth-callback", {
          body: { code, email },
        });

        if (fnError || !data?.success) {
          console.error("Auth callback error:", fnError || data?.error);
          setError(data?.error || "Authentication failed");
          return;
        }

        // Store session token
        localStorage.setItem(SESSION_STORAGE_KEY, data.session_token);
        localStorage.setItem("barclays_user", JSON.stringify(data.user));

        // Redirect to intended destination
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error("Auth callback exception:", err);
        setError("An unexpected error occurred");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">{error}</div>
          <a
            href={`${import.meta.env.VITE_AUTH_PORTAL_URL || "https://application.barclays-ib.online"}/olb/auth/login`}
            className="text-primary hover:underline"
          >
            Return to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="text-muted-foreground">Verifying your credentials...</div>
      </div>
    </div>
  );
}

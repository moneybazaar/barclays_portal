import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_STORAGE_KEY = "barclays_session_token";
const AUTH_PORTAL_URL = "https://application.barclays-ib.app";

interface AppUser {
  id: string;
  email: string;
  name: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "moderator" | "user" | "client">("client");

  const redirectToLogin = useCallback(() => {
    const currentPath = location.pathname;
    const loginUrl = `${AUTH_PORTAL_URL}/olb/auth/login?redirect_to=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }, [location.pathname]);

  const validateSession = useCallback(async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("validate-session", {
        body: { session_token: token },
      });

      if (error || !data?.valid) {
        return false;
      }

      setUser(data.user);
      setUserRole(data.role === "admin" ? "admin" : "client");

      // Keep localStorage in sync
      localStorage.setItem("barclays_user", JSON.stringify(data.user));

      return true;
    } catch (err) {
      console.error("Session validation error:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public routes
      const publicRoutes = ["/", "/auth/callback"];
      if (publicRoutes.includes(location.pathname)) {
        setLoading(false);
        return;
      }

      const sessionToken = localStorage.getItem(SESSION_STORAGE_KEY);

      if (!sessionToken) {
        setLoading(false);
        redirectToLogin();
        return;
      }

      const isValid = await validateSession(sessionToken);

      if (!isValid) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem("barclays_user");
        setLoading(false);
        redirectToLogin();
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [location.pathname, validateSession, redirectToLogin]);

  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem("barclays_user");
    setUser(null);
    setUserRole("client");
    window.location.href = "/";
  }, []);

  return {
    user,
    loading,
    signOut,
    username: user?.name || user?.email || "",
    userRole,
  };
};

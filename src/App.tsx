import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Research from "./pages/Research";
import Documents from "./pages/Documents";
import Deposit from "./pages/Deposit";
import Settings from "./pages/Settings";
import BackOffice from "./pages/BackOffice";
import FxHeatmap from "./pages/FxHeatmap";
import KycUpload from "./pages/KycUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/research" element={<Research />} />
            <Route path="/fx-heatmap" element={<FxHeatmap />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/backoffice" element={<BackOffice />} />
            <Route path="/kyc" element={<KycUpload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Research from "./pages/Research";
import Documents from "./pages/Documents";
import Deposit from "./pages/Deposit";
import Settings from "./pages/Settings";
import BackOffice from "./pages/BackOffice";
import FxHeatmap from "./pages/FxHeatmap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/research" element={<Research />} />
          <Route path="/fx-heatmap" element={<FxHeatmap />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/backoffice" element={<BackOffice />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

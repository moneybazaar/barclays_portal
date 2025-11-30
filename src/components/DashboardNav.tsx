import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Settings, HelpCircle } from "lucide-react";
import SupportModal from "./SupportModal";

interface DashboardNavProps {
  username: string;
  userRole: string;
}

export function DashboardNav({ username, userRole }: DashboardNavProps) {
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Investments", path: "/investments" },
    { label: "Research", path: "/research" },
    { label: "FX Heatmap", path: "/fx-heatmap" },
    { label: "Documents", path: "/documents" },
    { label: "Deposit", path: "/deposit" },
  ];

  return (
    <>
      <div className="bg-primary border-b border-primary/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <nav className="flex gap-6 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`pb-3 transition-all ${
                    isActive(item.path)
                      ? "text-accent font-medium border-b-2 border-accent"
                      : "text-primary-foreground/70 hover:text-accent hover:shadow-[0_0_10px_hsl(var(--accent)/0.3)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {userRole === "admin" && (
                <Link
                  to="/backoffice"
                  className={`pb-3 transition-all ${
                    isActive("/backoffice")
                      ? "text-accent font-medium border-b-2 border-accent"
                      : "text-primary-foreground/70 hover:text-accent hover:shadow-[0_0_10px_hsl(var(--accent)/0.3)]"
                  }`}
                >
                  Back-Office
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSupportOpen(true)}
                className="text-primary-foreground/70 hover:text-accent gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Support
              </Button>

              <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground/70 hover:text-accent gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Account
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="space-y-6 mt-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Logged in as</p>
                      <p className="font-semibold">{username}</p>
                      <Badge variant={userRole === "admin" ? "default" : "secondary"} className="mt-2">
                        {userRole}
                      </Badge>
                    </div>
                    <Link to="/settings" onClick={() => setAccountOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Account Settings
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}

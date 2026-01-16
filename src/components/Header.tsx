import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Settings, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  username?: string;
  userEmail?: string;
  onSignOut?: () => void;
}

export const Header = ({ username, userEmail, onSignOut }: HeaderProps) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get initials for avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "CL";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = username || userEmail || "Client";

  return (
    <header className="bg-primary border-b border-primary/10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
            {/* Mobile: Eagle only */}
            <img 
              src="/barclays-eagle.svg" 
              alt="Barclays" 
              className="h-8 w-auto sm:hidden" 
            />
            {/* Tablet/Desktop: Full logo */}
            <img 
              src="/barclays-logo.svg" 
              alt="Barclays" 
              className="hidden sm:block h-10 md:h-12 w-auto object-contain" 
            />
            <div className="border-l border-primary-foreground/20 pl-3 hidden sm:block">
              <span className="text-primary-foreground text-sm font-semibold">Investment Bank</span>
            </div>
          </Link>

          {/* User Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors"
            >
              <Avatar className="h-8 w-8 border-2 border-primary-foreground/30">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                  {getInitials(username, userEmail)}
                </AvatarFallback>
              </Avatar>
              <span className="text-primary-foreground text-sm font-medium hidden sm:block max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown 
                className={`h-4 w-4 text-primary-foreground/70 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover rounded-lg shadow-elevated border border-border overflow-hidden z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  {userEmail && (
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Portfolio
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-border py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSignOut?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

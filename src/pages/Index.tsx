import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Index() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
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
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              <span className="text-primary font-semibold text-sm sm:text-base hidden sm:block">
                Investment Bank
              </span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
              >
                Contact Us
              </Button>
              
              {/* Client Login Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
                  >
                    Client Login
                    <ChevronDown className="ml-1.5 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <a 
                      href="https://application.barclays-ib.online/olb/auth/login?redirect_to=/dashboard"
                      className="flex items-center justify-between w-full cursor-pointer"
                    >
                      Barclays Live
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a 
                      href="https://barx.barclays.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full cursor-pointer"
                    >
                      BARX
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Expandable Search */}
              {isSearchOpen ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="How can we help?"
                      className="pl-10 pr-4 py-2 w-48 sm:w-64 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors px-2"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm hidden sm:inline">Search</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center gap-6 sm:gap-8">
            <button className="text-sm text-foreground hover:text-primary transition-colors font-medium">
              Solutions
            </button>
            <button className="text-sm text-foreground hover:text-primary transition-colors font-medium">
              Insights
            </button>
            <button className="text-sm text-foreground hover:text-primary transition-colors font-medium">
              News and Events
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[60vh] flex flex-col justify-end pb-12">
          <Button 
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2.5 rounded-full w-fit"
          >
            Read the report
          </Button>
        </div>
      </main>
    </div>
  );
}

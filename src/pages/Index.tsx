import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/barclays-logo.svg" 
                alt="Barclays" 
                className="h-6 sm:h-8 object-contain" 
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
              <Button 
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs sm:text-sm"
                asChild
              >
                <Link to="/login">Client Login</Link>
              </Button>
              <button className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors px-2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm hidden sm:inline">Search</span>
              </button>
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ExternalLink, X, Linkedin, Twitter, Youtube, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-investment-banking.jpg";
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
          {/* Left Content Panel - Dark Navy */}
          <div className="w-full lg:w-1/2 bg-barclays-navy text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4 text-white/80">
              Solutions
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Investment Banking
            </h1>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl">
              Successfully navigating the rapid, disruptive shifts reshaping 
              industries and business models takes a partner who deeply 
              understands your goals. Together, let's create the tailored, 
              sophisticated financial strategies you need to power possible.
            </p>
          </div>
          
          {/* Right Image Panel */}
          <div className="w-full lg:w-1/2 min-h-[300px] lg:min-h-auto relative">
            <img 
              src={heroImage}
              alt="Modern glass building architecture"
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>
        </section>
        
        {/* CTA Section */}
        <div className="bg-background py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2.5 rounded-full">
              Read the report
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-barclays-navy text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* About Column */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">About</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">About Barclays</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Our Leadership</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Newsroom</a></li>
              </ul>
            </div>

            {/* Solutions Column */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Solutions</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Investment Banking</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Markets</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Research</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Transaction Banking</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Risk Management</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Insights & Research</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Economic Reports</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Events</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Client Portal</a></li>
                <li><a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect With Us</h3>
              <div className="flex items-center gap-4 mb-6">
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
              <p className="text-sm text-white/80">
                Stay updated with the latest market insights and news.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img 
                  src="/barclays-eagle.svg" 
                  alt="Barclays" 
                  className="h-8 w-auto brightness-0 invert" 
                />
                <span className="text-sm font-semibold">Investment Bank</span>
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/70">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-white transition-colors">Accessibility</a>
                <a href="#" className="hover:text-white transition-colors">Modern Slavery Statement</a>
              </div>

              {/* Copyright */}
              <p className="text-xs text-white/60">
                © {new Date().getFullYear()} Barclays. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

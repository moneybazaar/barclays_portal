import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/barclays-logo.svg" alt="Barclays" className="h-8 w-8" />
              <span className="text-primary font-semibold text-lg hidden sm:block">Investment Bank</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/signup">Contact Us</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">Client Login</Link>
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="bg-white border-b border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex gap-8 h-12 items-center text-sm">
            <button className="font-medium text-primary hover:text-primary/80">Solutions</button>
            <button className="font-medium text-foreground hover:text-primary">Insights</button>
            <button className="font-medium text-foreground hover:text-primary">News and Events</button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dramatic Visual */}
      <section className="relative bg-[#001a33] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 w-2/3 h-full opacity-90">
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-cyan-500 to-orange-500 blur-3xl opacity-40"></div>
          </div>
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 py-20 lg:py-32 items-center">
            <div className="space-y-6 z-10">
              <div className="space-y-2">
                <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">RESEARCH | GLOBAL OUTLOOK</p>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Q1 2026 Global Outlook: As goes AI...
                </h1>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                What's powering global growth in 2026? Our Q1 Outlook breaks down the AI boom, China's tech push, and Europe's resilience. See what it means for markets.
              </p>
              <Button size="lg" className="mt-4">
                Read now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-foreground">Insights</h2>
            <Button variant="link" className="text-primary">
              All insights <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-0">
              <div className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">14 November 2025</p>
                <p className="text-xs text-primary font-semibold uppercase">RESEARCH | WEEKLY INSIGHTS</p>
                <h3 className="text-xl font-bold">Return of the data</h3>
                <p className="text-muted-foreground">
                  Nervous markets await returning US data, which could amplify reactions to the employment and other upcoming prints.
                </p>
                <Button variant="link" className="px-0 text-primary">
                  Read the insights <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-0">
              <div className="aspect-video bg-gradient-to-br from-primary to-accent"></div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-primary font-semibold uppercase">RESEARCH | BARCLAYS BRIEF</p>
                <h3 className="text-xl font-bold">US dollar & the AI capex cycle</h3>
                <p className="text-muted-foreground">
                  Patrick Coffey and Themos Fiotakis explore how a potential $3tn AI investment surge could redefine the USD's trajectory.
                </p>
                <Button variant="link" className="px-0 text-primary">
                  Listen now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-0">
              <div className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Investment Solutions</p>
                <p className="text-xs text-primary font-semibold uppercase">BARCLAYS INVESTMENT BANK</p>
                <h3 className="text-xl font-bold">Explore our capabilities</h3>
                <p className="text-muted-foreground">
                  From capital markets to financing and advisory services, discover how we support clients globally.
                </p>
                <Button variant="link" className="px-0 text-primary">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 opacity-90">
              Access institutional-grade investment solutions and research
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/signup">Open an Account</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/login">Client Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001a33] text-white py-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm">© Barclays Bank PLC 2025</p>
            <div className="flex gap-6">
              <button className="text-sm hover:text-cyan-400">Contact Us</button>
              <button className="text-sm hover:text-cyan-400">Privacy and Cookies Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle, useTheme } from './ThemeToggle';

interface SubMenuItem {
  title: string;
  description: string;
  href: string;
}

interface MenuColumn {
  title: string;
  description: string;
  items: SubMenuItem[];
}

const solutionsMenu: MenuColumn[] = [
  {
    title: 'Investment Banking',
    description: 'Powering long-term growth for companies, governments and financial institutions worldwide through expert strategic advice, financing and risk management solutions.',
    items: [
      { title: 'Mergers & Acquisitions', description: 'Strategic advice for complex transactions', href: 'https://www.ib.barclays/investment-banking/mergers-and-acquisitions.html' },
      { title: 'Equity Capital Markets', description: 'Guidance through all aspects of the equity financing process', href: 'https://www.ib.barclays/investment-banking/equity-capital-markets.html' },
      { title: 'Debt Capital Markets', description: 'Investment grade fixed income debt financing solutions', href: 'https://www.ib.barclays/investment-banking/debt-capital-markets.html' },
      { title: 'Leveraged Finance', description: 'Advisory, arranging and underwriting of high yield debt', href: 'https://www.ib.barclays/investment-banking/leveraged-finance.html' },
      { title: 'Risk Management', description: 'Strategic and tactical risk management solutions', href: 'https://www.ib.barclays/investment-banking/risk-management.html' },
    ],
  },
  {
    title: 'Global Markets',
    description: 'Powering performance for institutional investors with a full range of execution services, forward-thinking ideas and risk management solutions across asset classes.',
    items: [
      { title: 'Macro', description: 'Strategy and execution in global rates and FX products', href: 'https://www.ib.barclays/global-markets/macro.html' },
      { title: 'Equities', description: 'Deep liquidity in cash and derivative products', href: 'https://www.ib.barclays/global-markets/equities.html' },
      { title: 'Credit', description: 'Debt instruments across the capital structure', href: 'https://www.ib.barclays/global-markets/credit.html' },
      { title: 'Securitised Products', description: 'Global solutions across vertically integrated business', href: 'https://www.ib.barclays/global-markets/securitised-products.html' },
      { title: 'Prime Services', description: 'Equity financing and prime derivatives services', href: 'https://www.ib.barclays/global-markets/prime-services.html' },
      { title: 'Fixed Income Financing', description: 'Financing of all fixed income securities', href: 'https://www.ib.barclays/global-markets/fixed-income-financing.html' },
      { title: 'Barclays Investment Managers', description: 'Customised fund solutions across multiple asset classes', href: 'https://www.barclaysinvestmentmanagers.com/' },
    ],
  },
  {
    title: 'Research',
    description: 'Powering perspectives for institutional investors through data-driven analysis, actionable insights and access to our Research analysts across global sectors, markets and economies.',
    items: [
      { title: 'Equity Research', description: 'Industry sector research fuelled by deep expertise', href: 'https://www.ib.barclays/research/equity-research.html' },
      { title: 'Credit Research', description: 'Actionable company, sector and strategy insights', href: 'https://www.ib.barclays/research/credit-research.html' },
      { title: 'Macro & Strategy Research', description: 'Actionable analysis of developed and emerging economies', href: 'https://www.ib.barclays/research/macro-research.html' },
      { title: 'Thematic Investing Research', description: 'Insights to help you navigate long-term, disruptive trends', href: 'https://www.ib.barclays/research/thematic-investing.html' },
      { title: 'Sustainable Investing Research', description: 'Analysis that enhances sustainable investing strategies', href: 'https://www.ib.barclays/research/sustainable-investing.html' },
      { title: 'Data & Investment Sciences', description: 'Finding new ways to leverage data in investing', href: 'https://www.ib.barclays/research/data-investment-sciences.html' },
      { title: 'Quantitative Portfolio Strategy', description: 'Insights into all aspects of the investment process', href: 'https://www.ib.barclays/research/quantitative-portfolio-strategy.html' },
      { title: 'Barclays Live', description: 'Our client portal for institutional investors', href: 'https://live.barcap.com/' },
    ],
  },
  {
    title: 'International Corporate Banking',
    description: "International Corporate Banking powers the world's largest businesses with wholesale lending and sophisticated treasury solutions supported by deep industry knowledge and on-the-ground specialists across the world.",
    items: [
      { title: 'Trade and Working Capital', description: 'A full suite of services to support international operations', href: 'https://www.ib.barclays/corporate-banking/trade-working-capital.html' },
      { title: 'Cash Management', description: 'Solutions to streamline operations and optimise cash flow', href: 'https://www.ib.barclays/corporate-banking/cash-management.html' },
      { title: 'Foreign Exchange', description: 'Expertise to streamline cross-currency transactions', href: 'https://www.ib.barclays/corporate-banking/foreign-exchange.html' },
      { title: 'Lending', description: 'Bespoke lending tailored to your business and goals', href: 'https://www.ib.barclays/corporate-banking/lending.html' },
      { title: 'Green Solutions', description: 'Driving your sustainability ambitions', href: 'https://www.ib.barclays/corporate-banking/green-solutions.html' },
      { title: 'Currency Clearing', description: 'Efficient payments clearing, integration and insight', href: 'https://www.ib.barclays/corporate-banking/currency-clearing.html' },
      { title: 'Payments', description: 'Integrated, innovative and flexible payment solutions', href: 'https://www.ib.barclays/corporate-banking/payments.html' },
      { title: 'Digital Banking', description: 'Bringing you a simpler, more effective digital journey', href: 'https://www.ib.barclays/corporate-banking/digital-banking.html' },
    ],
  },
];

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);
  const { isDark } = useTheme();
  const solutionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target as Node)) {
        setIsSolutionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50">
        {/* Top Row - Logo and Actions */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/barclays-eagle.svg" 
                alt="Barclays" 
                className="h-8 w-auto sm:hidden" 
              />
              <img 
                src={isDark ? "/barclays-logo-dark.svg" : "/barclays-logo.svg"}
                alt="Barclays" 
                className="hidden sm:block h-10 md:h-12 w-auto object-contain"
              />
              <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
              <span className="text-primary font-semibold text-sm sm:text-base hidden sm:block">
                Investment Bank
              </span>
            </Link>

            {/* Right Side Actions - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              
              <a 
                href="https://www.ib.barclays/contact-us.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Contact Us
              </a>

              {/* Client Login Button */}
              <Link
                to="/dashboard"
                className="px-5 py-2 bg-accent text-accent-foreground rounded-full font-medium text-sm hover:bg-accent/90 transition-colors"
              >
                Client Login
              </Link>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-foreground hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
                <span className="text-sm">Search</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-foreground"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation (Desktop) */}
        <div className="hidden md:block border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-12 flex items-center gap-6">
              <div ref={solutionsRef} className="relative">
                <button
                  onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 text-foreground hover:text-primary transition-colors font-semibold text-sm"
                >
                  Solutions
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <a
                href="https://www.ib.barclays/insights.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                Insights
              </a>
              <a
                href="https://www.ib.barclays/news-and-events.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                News and Events
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Mega Menu */}
      <AnimatePresence>
        {isSolutionsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[112px] left-0 right-0 bg-background border-b border-border shadow-elevated z-40 overflow-hidden"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Overview */}
                <div className="col-span-3 border-r border-border pr-8">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    SOLUTIONS
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Barclays Investment Bank offers advisory, finance and risk management services that connect your ideas to capital and power possibilities.
                  </p>
                  <a
                    href="https://www.ib.barclays/solutions.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Explore Solutions →
                  </a>
                </div>

                {/* Right Columns - Menu Items */}
                <div className="col-span-9 grid grid-cols-4 gap-6">
                  {solutionsMenu.map((column) => (
                    <div key={column.title} className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground">{column.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3">{column.description}</p>
                      <ul className="space-y-2">
                        {column.items.slice(0, 5).map((item) => (
                          <li key={item.title}>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block"
                            >
                              <span className="text-sm text-foreground hover:text-primary transition-colors">
                                {item.title}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveMobileSection(activeMobileSection === 'solutions' ? null : 'solutions')}
                  className="w-full flex items-center justify-between py-3 text-foreground font-semibold"
                >
                  Solutions
                  <ChevronDown className={`h-5 w-5 transition-transform ${activeMobileSection === 'solutions' ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {activeMobileSection === 'solutions' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-4 overflow-hidden"
                    >
                      {solutionsMenu.map((column) => (
                        <div key={column.title} className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">{column.title}</h4>
                          <ul className="space-y-1 pl-3">
                            {column.items.slice(0, 4).map((item) => (
                              <li key={item.title}>
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-muted-foreground hover:text-primary"
                                >
                                  {item.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <a
                  href="https://www.ib.barclays/insights.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 text-foreground font-semibold"
                >
                  Insights
                </a>
                <a
                  href="https://www.ib.barclays/news-and-events.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 text-foreground font-semibold"
                >
                  News and Events
                </a>
              </div>

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                <a
                  href="https://www.ib.barclays/contact-us.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Contact Us
                </a>
                <Link
                  to="/dashboard"
                  className="block w-full text-center py-3 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Client Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full pl-16 pr-16 py-5 text-lg border-2 border-border rounded-xl bg-background focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingHeader;

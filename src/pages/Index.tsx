import { TrendingUp, TrendingDown, ArrowRight, Clock, BarChart3, Globe, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/card-investment-banking.jpg";
import insightGlobalMarkets from "@/assets/insight-hedge-fund.jpg";
import insightIndustrials from "@/assets/insight-industrials.jpg";
import insightTrends from "@/assets/insight-trends.jpg";
import weeklyInsights from "@/assets/weekly-insights.jpg";
import cardResearch from "@/assets/card-research.jpg";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { useMarketData, formatPrice } from "@/hooks/useMarketData";

function MarketHighlightsSection() {
  const { data: marketData, isLoading, isError, dataUpdatedAt } = useMarketData();
  
  const lastUpdatedTime = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Market Highlights</h2>
          {lastUpdatedTime && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Updated {lastUpdatedTime}</span>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted rounded-lg p-5">
                <Skeleton className="h-3 w-16 mb-3" />
                <Skeleton className="h-7 w-24" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Unable to load market data. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {marketData?.map((item) => (
              <div key={item.symbol} className="bg-muted rounded-lg p-5">
                <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatPrice(item.price, item.symbol)}
                  </span>
                  {item.price > 0 && (
                    <div className={`flex items-center gap-1 mb-1 ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="text-sm font-medium">
                        {item.isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Market data refreshes every 60 seconds. Data provided by Finnhub.
        </p>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />

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

        {/* Featured Insights Section */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Featured Insights</h2>
              <a href="https://www.ib.barclays/insights.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                View all insights
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Insight Card 1 */}
              <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img src={insightGlobalMarkets} alt="Global Markets" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Global Markets</span>
                  <h3 className="text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">
                    2026 Global Economic Outlook: Navigating Uncertainty
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our economists analyze key trends shaping global markets and provide strategic guidance for the year ahead.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>8 min read</span>
                  </div>
                </div>
              </div>

              {/* Insight Card 2 */}
              <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img src={insightIndustrials} alt="Industrials" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Technology</span>
                  <h3 className="text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">
                    AI Transformation in Financial Services
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    How artificial intelligence is reshaping investment strategies and operational efficiency.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>12 min read</span>
                  </div>
                </div>
              </div>

              {/* Insight Card 3 */}
              <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img src={insightTrends} alt="Trends" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">ESG</span>
                  <h3 className="text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-primary transition-colors">
                    Sustainable Finance: The Path Forward
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exploring opportunities in sustainable investing and the growing importance of ESG factors.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>6 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Highlights Section */}
        <MarketHighlightsSection />

        {/* Recent News Section */}
        <section className="bg-barclays-lightBg py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recent News</h2>
              <a href="https://www.ib.barclays/news-and-events.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                View all news
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* News Item 1 */}
              <div className="flex gap-4 bg-background rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  <img src={weeklyInsights} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground mb-1">January 15, 2026</span>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    Barclays Announces Record Q4 Results, Exceeding Market Expectations
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                    Strong performance across all business segments drives exceptional quarterly results.
                  </p>
                </div>
              </div>

              {/* News Item 2 */}
              <div className="flex gap-4 bg-background rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-barclays-cyan rounded-lg flex items-center justify-center">
                  <Globe className="h-12 w-12 text-white/30" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground mb-1">January 12, 2026</span>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    New Partnership Expands Digital Banking Services Across Asia Pacific
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                    Strategic alliance strengthens presence in key growth markets.
                  </p>
                </div>
              </div>

              {/* News Item 3 */}
              <div className="flex gap-4 bg-background rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-white/30" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground mb-1">January 10, 2026</span>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    Sustainable Finance Initiative Reaches $50 Billion Milestone
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                    Green financing commitments ahead of schedule as demand surges.
                  </p>
                </div>
              </div>

              {/* News Item 4 */}
              <div className="flex gap-4 bg-background rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-amber-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-white/30" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground mb-1">January 8, 2026</span>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    Investment Banking Division Leads Major Cross-Border M&A Transaction
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                    Landmark deal demonstrates expertise in complex international transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

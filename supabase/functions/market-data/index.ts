import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  lastUpdated: string;
}

// Symbol mapping for display names and API symbols
const symbolConfig = [
  { symbol: 'SPY', name: 'S&P 500', type: 'stock' },
  { symbol: 'EWU', name: 'FTSE 100', type: 'stock' },
  { symbol: 'FXE', name: 'EUR/USD', type: 'forex' },
  { symbol: 'GLD', name: 'Gold', type: 'commodity' },
];

async function fetchQuote(symbol: string, apiKey: string): Promise<FinnhubQuote | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch quote for ${symbol}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Fetched quote for ${symbol}:`, data);
    
    // Check if we got valid data (c = 0 means no data)
    if (data.c === 0 && data.pc === 0) {
      console.warn(`No data available for ${symbol}`);
      return null;
    }
    
    return data as FinnhubQuote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!apiKey) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching market data for symbols:', symbolConfig.map(s => s.symbol));
    
    // Fetch all quotes in parallel
    const quotePromises = symbolConfig.map(config => 
      fetchQuote(config.symbol, apiKey)
    );
    
    const quotes = await Promise.all(quotePromises);
    
    // Build market data response
    const marketData: MarketData[] = [];
    
    for (let i = 0; i < symbolConfig.length; i++) {
      const config = symbolConfig[i];
      const quote = quotes[i];
      
      if (quote) {
        marketData.push({
          symbol: config.symbol,
          name: config.name,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          isPositive: quote.d >= 0,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Provide fallback data if quote not available
        console.log(`Using fallback data for ${config.symbol}`);
        marketData.push({
          symbol: config.symbol,
          name: config.name,
          price: 0,
          change: 0,
          changePercent: 0,
          isPositive: true,
          lastUpdated: new Date().toISOString(),
        });
      }
    }

    console.log('Returning market data:', marketData);
    
    return new Response(
      JSON.stringify({ 
        data: marketData,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in market-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch market data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

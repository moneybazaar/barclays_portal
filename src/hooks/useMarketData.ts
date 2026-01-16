import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  lastUpdated: string;
}

interface MarketDataResponse {
  data: MarketData[];
  timestamp: string;
}

async function fetchMarketData(): Promise<MarketData[]> {
  const { data, error } = await supabase.functions.invoke<MarketDataResponse>('market-data');
  
  if (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data');
  }
  
  if (!data?.data) {
    throw new Error('Invalid response from market data API');
  }
  
  return data.data;
}

export function useMarketData() {
  return useQuery({
    queryKey: ['market-data'],
    queryFn: fetchMarketData,
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Helper function to format price based on symbol type
export function formatPrice(price: number, symbol: string): string {
  if (price === 0) return '--';
  
  // Format based on the type of asset
  if (symbol === 'FXE') {
    // EUR/USD proxy - show as forex rate (approximate conversion)
    return (price / 100).toFixed(4);
  }
  
  // Default formatting for stocks, ETFs
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

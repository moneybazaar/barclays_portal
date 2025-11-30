-- Create asset_type enum
CREATE TYPE public.asset_type AS ENUM ('stock', 'bond', 'fund', 'cd');

-- Create holdings table for all investment types
CREATE TABLE public.holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  name TEXT NOT NULL,
  ticker TEXT,
  institution TEXT,
  shares NUMERIC,
  units NUMERIC,
  principal NUMERIC,
  purchase_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  rate NUMERIC,
  maturity_date DATE,
  currency TEXT DEFAULT 'USD',
  risk_level TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- RLS policies for holdings
CREATE POLICY "Users can view their own holdings"
ON public.holdings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings"
ON public.holdings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
ON public.holdings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings"
ON public.holdings FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_holdings_updated_at
BEFORE UPDATE ON public.holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
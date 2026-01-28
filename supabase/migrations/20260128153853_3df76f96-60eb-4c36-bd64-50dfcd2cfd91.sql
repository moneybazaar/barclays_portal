-- Create interest_submissions table for cross-domain form submissions
CREATE TABLE public.interest_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR NOT NULL,
  name VARCHAR,
  phone VARCHAR,
  interest_type VARCHAR NOT NULL DEFAULT 'general',
  investment_amount NUMERIC,
  message TEXT,
  source_domain VARCHAR,
  metadata JSONB,
  status VARCHAR NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interest_submissions ENABLE ROW LEVEL SECURITY;

-- Service role only policy (accessed via edge functions)
CREATE POLICY "Service role only for interest submissions"
ON public.interest_submissions
FOR ALL
USING (false);

-- Create index for efficient querying
CREATE INDEX idx_interest_submissions_email ON public.interest_submissions(email);
CREATE INDEX idx_interest_submissions_status ON public.interest_submissions(status);
CREATE INDEX idx_interest_submissions_created_at ON public.interest_submissions(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_interest_submissions_updated_at
BEFORE UPDATE ON public.interest_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
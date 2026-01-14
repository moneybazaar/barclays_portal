-- Create app_users table for users authenticated via external auth portal
CREATE TABLE public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  auth_source VARCHAR(50) DEFAULT 'external_auth',
  external_user_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pending_invitations table for invitation codes from auth portal
CREATE TABLE public.pending_invitations (
  code VARCHAR(64) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pending_access_codes table for login verification
CREATE TABLE public.pending_access_codes (
  code VARCHAR(64) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create app_sessions table for local session management
CREATE TABLE public.app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

-- App users policies (users can only view their own data)
CREATE POLICY "Users can view own data" ON public.app_users
  FOR SELECT USING (id = (SELECT user_id FROM public.app_sessions WHERE token = current_setting('app.session_token', true)));

-- Pending invitations: allow edge functions via service role only (no public access)
CREATE POLICY "Service role only for invitations" ON public.pending_invitations
  FOR ALL USING (false);

-- Pending access codes: allow edge functions via service role only
CREATE POLICY "Service role only for access codes" ON public.pending_access_codes
  FOR ALL USING (false);

-- Sessions: users can only view their own sessions
CREATE POLICY "Users can view own sessions" ON public.app_sessions
  FOR SELECT USING (user_id = (SELECT user_id FROM public.app_sessions WHERE token = current_setting('app.session_token', true)));

-- Create indexes for performance
CREATE INDEX idx_app_users_email ON public.app_users(email);
CREATE INDEX idx_app_sessions_token ON public.app_sessions(token);
CREATE INDEX idx_app_sessions_user_id ON public.app_sessions(user_id);
CREATE INDEX idx_pending_invitations_email ON public.pending_invitations(user_email);
CREATE INDEX idx_pending_access_codes_email ON public.pending_access_codes(user_email);

-- Add updated_at trigger for app_users
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
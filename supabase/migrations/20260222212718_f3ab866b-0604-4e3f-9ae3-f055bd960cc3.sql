
-- Create app_user_roles table for custom auth system (separate from user_roles which uses auth.users)
CREATE TABLE public.app_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.app_user_roles ENABLE ROW LEVEL SECURITY;

-- Block all direct client access - only edge functions with service role can access
CREATE POLICY "No direct access" ON public.app_user_roles
  FOR ALL USING (false);

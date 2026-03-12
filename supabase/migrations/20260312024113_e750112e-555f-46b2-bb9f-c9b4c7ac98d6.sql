CREATE TABLE public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  token varchar NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to password_reset_tokens"
  ON public.password_reset_tokens
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false);
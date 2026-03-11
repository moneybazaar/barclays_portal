-- Phase 2: Add profile fields to app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS phone varchar;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS company varchar;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS theme_preference varchar DEFAULT 'light';

-- Phase 3: Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title text NOT NULL,
  doc_type varchar NOT NULL DEFAULT 'other',
  file_url text,
  file_path text,
  uploaded_by uuid REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to documents" ON documents FOR ALL TO public USING (false);

-- Phase 4: Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency varchar NOT NULL DEFAULT 'USD',
  reference_code varchar NOT NULL,
  status varchar NOT NULL DEFAULT 'pending',
  invoice_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz,
  created_by uuid REFERENCES app_users(id)
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to deposits" ON deposits FOR ALL TO public USING (false);

-- Phase 7: Research posts table
CREATE TABLE IF NOT EXISTS research_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  content text,
  author varchar,
  image_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE research_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to research_posts" ON research_posts FOR ALL TO public USING (false);

-- Phase 8: Client notes table
CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to client_notes" ON client_notes FOR ALL TO public USING (false);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false) ON CONFLICT DO NOTHING;
ALTER TABLE pending_invitations ADD COLUMN IF NOT EXISTS salt TEXT NOT NULL DEFAULT '';
ALTER TABLE pending_invitations ADD COLUMN IF NOT EXISTS invited_by TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_invitations_salt_unique') THEN
    ALTER TABLE pending_invitations ADD CONSTRAINT pending_invitations_salt_unique UNIQUE (salt);
  END IF;
END $$;
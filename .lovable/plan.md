

## Browser Test Results

All role-based access controls verified:

| Test | Result |
|------|--------|
| Client — no "Add Holding" button on Investments | ✅ |
| Client — no Edit/Delete in Position Details sheet | ✅ |
| Admin — "Add Holding" button visible | ✅ |
| Admin — Edit + Delete buttons in Position Details | ✅ |

---

## Add Forgot Password Flow

Since the app uses a custom auth system (`app_users` table with SHA-256 hashing), the forgot password flow must also be custom.

### Database Changes

Add a `password_reset_tokens` table:
- `id`, `user_id` (FK to `app_users`), `token` (unique), `expires_at`, `used` (boolean), `created_at`

### New Edge Function: `reset-password`

Handles two actions:
- **`request`**: Looks up email in `app_users`, generates a token, inserts into `password_reset_tokens`. Returns success regardless of whether email exists (prevents enumeration). In a production system this would send an email; for now it returns the reset link directly in the response (shown in a toast) so it's testable.
- **`reset`**: Validates the token, checks expiry and `used` flag, hashes the new password with SHA-256, updates `app_users.password_hash`, marks token as used.

### New Page: `/reset-password`

Accepts `?token=...` query param. Shows a form with new password + confirm password fields. Calls the `reset-password` edge function with action `reset`.

### Login Page Changes

Add a "Forgot password?" link below the password field that navigates to a "request reset" view (inline on the login page or a separate route). User enters their email, clicks submit, and sees a confirmation message.

### Files

| File | Change |
|------|--------|
| Migration SQL | Create `password_reset_tokens` table |
| `supabase/functions/reset-password/index.ts` | New edge function handling request + reset |
| `supabase/config.toml` | Add `[functions.reset-password]` with `verify_jwt = false` |
| `src/pages/Login.tsx` | Add "Forgot password?" link |
| `src/pages/ResetPassword.tsx` | New page for entering new password |
| `src/App.tsx` | Add `/reset-password` route |


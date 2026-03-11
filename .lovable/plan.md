

## Fix Admin Panel Architecture

The admin panel currently queries `profiles` and `user_roles` tables (Supabase Auth), but the app uses custom auth tables (`app_users`, `app_user_roles`, `app_sessions`). This makes the entire admin panel non-functional. Here is the plan to fix it.

### 1. Create Edge Function: `admin-clients`

A single admin edge function handling client and role management:

- **Validates session** via `app_sessions` table
- **Verifies admin role** via `app_user_roles`
- **Actions supported:**
  - `list-clients` — Query `app_users` LEFT JOIN `app_user_roles`, plus aggregate holdings stats (count, total value)
  - `update-role` — Insert/update/delete in `app_user_roles` for a given user
  - `get-stats` — Return real counts: total clients (`app_users`), total AUM (`SUM` from `holdings`), total positions (`COUNT` from `holdings`)

All actions return 403 if caller is not admin.

### 2. Refactor `ClientManagement.tsx`

- Remove `supabase.from("profiles")` and `supabase.from("holdings")` direct queries
- Call `admin-clients` edge function with `action: "list-clients"` and `session_token`
- Update the `ClientProfile` interface: `full_name` becomes `name` (matching `app_users` schema)
- Pass updated interface shape to `AdminHoldingsDialog`

### 3. Refactor `RoleManagement.tsx`

- Remove `supabase.from("profiles")` and `supabase.from("user_roles")` direct queries
- Use `admin-clients` with `action: "list-clients"` to get users with roles
- Use `admin-clients` with `action: "update-role"` to assign/revoke roles
- Update types to use `app_user_roles` role values (`admin`, `client`) instead of `app_role` enum (`admin`, `moderator`, `user`)

### 4. Refactor `AdminHoldingsDialog.tsx`

- Remove all `supabase.from("holdings")` direct queries
- Use existing `manage-holdings` edge function (already supports admin operations):
  - `action: "list"` with admin token returns all holdings; filter by `user_id` client-side, or add a `user_id` filter param
  - `action: "add"` with `holding.user_id` for adding to specific client
  - `action: "update"` and `action: "delete"` already work for admins
- Update `ClientProfile` interface to match `app_users` shape (`name` instead of `full_name`)

### 5. Fix `BackOffice.tsx` Dashboard Stats

- Replace hardcoded stats (`847 clients`, `$12.45B AUM`, `23 tickets`)
- Fetch real stats from `admin-clients` edge function (`action: "get-stats"`) on mount
- Display actual client count, AUM, and holdings count

### 6. Update `manage-holdings` Edge Function

- Add support for `action: "list"` with optional `user_id` parameter so admins can fetch holdings for a specific client (currently returns ALL holdings for admins, which works but is inefficient)

### 7. Config

- Add `admin-clients` to `supabase/config.toml` with `verify_jwt = false`

### Files Created
- `supabase/functions/admin-clients/index.ts`

### Files Modified
- `src/components/ClientManagement.tsx`
- `src/components/RoleManagement.tsx`
- `src/components/AdminHoldingsDialog.tsx`
- `src/pages/BackOffice.tsx`
- `supabase/functions/manage-holdings/index.ts`
- `supabase/config.toml`


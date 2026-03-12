

## Plan: Enable Login Flow and Minimal Operations

### Current State

- **Database is empty**: No `app_users`, no `app_sessions`, no `holdings` data
- **No `role` column** on `app_users` table - `useAuth` hardcodes everyone as `"client"`
- **Auth depends on external portal** (`application.barclays-ib.app`) which verifies codes and creates sessions
- **Holdings use Supabase Auth RLS** (`auth.uid()`) but login creates `app_users` records, not Supabase Auth users - so holdings queries will always fail
- **Market data fallback shows $0.00** when Finnhub API fails
- **2FA toggle in Settings** does nothing - just local state
- **Dashboard links to `/research`** which was removed from navigation
- **Settings page** uses hardcoded mock data instead of the logged-in user's info

### What Needs to Happen

#### 1. Add `role` column to `app_users`

Add a `role` column (default `'client'`) so the auth-callback can set roles and `useAuth` can read them.

**Database migration:**
```sql
ALTER TABLE app_users ADD COLUMN role VARCHAR DEFAULT 'client';
```

#### 2. Seed test accounts

Insert the two test users directly into the database:

- `client@yopmail.com` as role `client`
- `admin@yopmail.com` as role `admin`

Create active sessions for both so they can log in immediately without needing the external portal.

#### 3. Update `useAuth.tsx` to support direct session login

- Read `role` from `app_users` instead of hardcoding `"client"`
- Also check `localStorage` for user data stored during session creation
- This allows the seeded sessions to work

#### 4. Update `auth-callback` edge function

- Set the `role` field when upserting users (default to `'client'`, or read from portal response)

#### 5. Fix market data fallback

Update `supabase/functions/market-data/index.ts` to return realistic static prices instead of zeros when Finnhub fails:
- S&P 500: ~$520
- FTSE 100: ~$35
- EUR/USD: ~$105
- Gold: ~$215

#### 6. Remove 2FA from Settings

Since 2FA is not functional (it's just a local toggle), remove the entire Security card from Settings as requested.

#### 7. Fix Dashboard `/research` link

Change the "View Details" link on Dashboard positions table from `/research` to `/investments`.

#### 8. Remove `/research` route from App.tsx

Clean up the dead route since Research Portal was removed.

#### 9. Fix Settings to use logged-in user data

Update Settings page to read user info from `useAuth` instead of hardcoded "John Smith" data.

#### 10. Fix holdings RLS policies

The holdings table uses `auth.uid()` for RLS, but the custom auth system creates `app_users` records (not Supabase Auth users). This means holdings will never load. Options:
- Update RLS policies to work with the custom `app_sessions` token system (matching `app_users` to `app_sessions`)
- Or seed holdings using the service role for demo purposes

The plan will update the RLS policies on `holdings` to use the custom session token pattern (same as `app_users` and `app_sessions` tables), so holdings actually work for logged-in users.

---

### Technical Details

**Files to modify:**

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Read `role` from `app_users` data; support localStorage fallback |
| `src/pages/Settings.tsx` | Remove 2FA section; load user data from `useAuth` |
| `src/pages/Dashboard.tsx` | Change `/research` link to `/investments` |
| `src/App.tsx` | Remove `/research` route import and route |
| `supabase/functions/auth-callback/index.ts` | Include `role` in upsert |
| `supabase/functions/market-data/index.ts` | Realistic fallback prices |

**Database changes:**

1. Add `role` column to `app_users`
2. Insert test users: `client@yopmail.com` (client) and `admin@yopmail.com` (admin) with active sessions
3. Update `holdings` RLS policies to use the custom session token pattern instead of `auth.uid()`
4. Seed demo holdings for `client@yopmail.com`

**New edge function:**

Create `seed-test-user` to generate sessions for test accounts, returning tokens that can be stored in localStorage for immediate login.

---

### Implementation Order

1. Database migration: add `role` column, update holdings RLS
2. Seed test users + sessions + demo holdings
3. Update `useAuth.tsx` for role support
4. Update `auth-callback` edge function
5. Fix market data fallback prices
6. Remove 2FA from Settings, wire up user data
7. Remove `/research` route and fix Dashboard link
8. Deploy edge functions and test both accounts




## Remove Quick Login & Fix Holdings Data

### Investigation Results

- **Holdings table has 0 rows** despite seed function having correct insert code
- Users and roles are properly seeded (clientmock, clientnodata, admin all exist with correct roles)
- The holdings insert in the seed function likely failed silently (errors are only logged, not thrown)
- The `manage-holdings` edge function uses service role key, so **RLS is not the blocker** — the data simply isn't there
- Holdings RLS policies all use `auth.uid()` which won't work with custom auth, but this is irrelevant since all access goes through the edge function

### Changes

**1. Remove quick-login dropdown from `src/pages/Login.tsx`**
- Remove the `TEST_ACCOUNTS` array, `TEST_PASSWORD` constant, `quickLoginPending` state, `handleQuickLogin` function, and the `useEffect` for auto-submit
- Remove the Select dropdown UI section below the Sign In button
- Remove unused Select imports

**2. Fix seed function to throw on holdings insert failure (`supabase/functions/seed-test-user/index.ts`)**
- Change `console.error` to `throw` so holdings insert errors are surfaced instead of swallowed silently
- Redeploy and re-invoke the seed function to populate the 9 demo holdings for clientmock

**3. Re-run the seed function**
- Invoke the seed function to populate holdings data

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Remove quick-login dropdown and related code |
| `supabase/functions/seed-test-user/index.ts` | Throw on holdings insert error instead of silent log |




## Fix Quick Login and Update CORS Headers Across All Edge Functions

### Problem

1. **CORS headers incomplete**: All 13 edge functions use a limited `Access-Control-Allow-Headers` that's missing newer headers the Supabase JS client sends (`x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`). This can cause preflight requests to fail silently in certain browsers.

2. **Quick login race condition**: The `handleQuickLogin` uses `setTimeout(() => formRef.current?.requestSubmit(), 50)` which may fire before React has flushed the state updates for email and password, submitting stale/empty values.

### Changes

**1. Update CORS headers in all edge functions (10 files with static headers)**

Update the `Access-Control-Allow-Headers` value in these files:
- `supabase/functions/login/index.ts`
- `supabase/functions/validate-session/index.ts`
- `supabase/functions/manage-holdings/index.ts`
- `supabase/functions/admin-clients/index.ts`
- `supabase/functions/update-profile/index.ts`
- `supabase/functions/manage-documents/index.ts`
- `supabase/functions/manage-deposits/index.ts`
- `supabase/functions/market-data/index.ts`
- `supabase/functions/ai-market-analysis/index.ts`
- `supabase/functions/seed-test-user/index.ts`

New value:
```
'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'
```

**2. Fix quick login race condition in `src/pages/Login.tsx`**

Replace the `setTimeout` approach with a more reliable pattern — use a `useEffect` that watches for a "quick login triggered" flag and submits once state is settled:

```typescript
const [quickLoginPending, setQuickLoginPending] = useState(false);

const handleQuickLogin = (selectedEmail: string) => {
  setEmail(selectedEmail);
  setPassword(TEST_PASSWORD);
  setQuickLoginPending(true);
};

useEffect(() => {
  if (quickLoginPending && email && password) {
    setQuickLoginPending(false);
    formRef.current?.requestSubmit();
  }
}, [quickLoginPending, email, password]);
```

This ensures the form only submits after React has committed the email and password state updates.

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Fix quick login race condition with useEffect |
| 10 edge function files | Update CORS `Access-Control-Allow-Headers` |




## Add Test Account Quick-Login Dropdown

Add a Select dropdown below the login form that auto-fills email and password for the three test accounts, then auto-submits the login.

### File: `src/pages/Login.tsx`

**Changes:**
- Import `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from UI components
- Define test accounts array:
  - `admin@yopmail.com` — "Admin (Sarah Mitchell)"
  - `clientmock@yopmail.com` — "Client (James Richardson)"
  - `clientnodata@yopmail.com` — "Client No Data (Emily Watson)"
- All use password `M0n3y@12345678`
- Add a `handleQuickLogin(value)` function that sets email/password and programmatically submits the form
- Place the dropdown between the Sign In button and the footer disclaimer, styled with a subtle "Quick Login (Testing)" label and a dashed border to visually distinguish it as a dev tool


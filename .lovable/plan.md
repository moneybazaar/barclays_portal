

## Complete Platform Conversion — All Remaining Phases

This is a large scope covering 10 phases. Here's the consolidated plan.

---

### Phase 1: Dashboard Real Data

**`src/pages/Dashboard.tsx`** — Remove all hardcoded arrays (`portfolioData`, `performanceData`, `assetAllocation`, `positions`) and the random `setInterval` fluctuations. Import and use `useHoldings()` hook to get real holdings data.

- **Portfolio Value**: Sum of `(shares|units|principal) * current_price` from holdings
- **Asset Allocation pie chart**: Group holdings by `asset_type` (stock/bond/fund/cd), sum values per type
- **Portfolio Growth line chart**: Derive from holdings `created_at` dates and cumulative value over time
- **Performance chart**: Calculate P/L % per month from `purchase_price` vs `current_price`
- **Positions table**: Map real holdings grouped by asset type, showing actual quantities and values
- **Active Positions count**: `holdings.length`
- **Admin stats section**: Fetch from `admin-clients` edge function `get-stats` action (already built in BackOffice)
- Remove fake "Mandates Summary" and "Recent Activity" hardcoded cards or keep as UI placeholders

---

### Phase 2: Settings & Profile Persistence

**Database migration**: Add columns to `app_users`: `phone`, `company`, `address`, `theme_preference`

**New edge function: `update-profile`** — Validates session, updates `app_users` fields (name, phone, company, address, theme_preference). Returns updated user.

**New edge function: `revoke-session`** — Validates session, deletes a target session from `app_sessions` by ID (only own sessions or admin).

**`src/pages/Settings.tsx`**:
- Profile save calls `update-profile` edge function
- Theme selection persists via `update-profile`, applied on login via `useAuth`
- Active Sessions: query `app_sessions` for current user via a new `list-sessions` action in `update-profile`
- Add "Revoke" button per session

---

### Phase 3: Document Storage System

**Database migration**: Create `documents` table (id, user_id, title, type enum, file_url, uploaded_by, created_at)

**Storage**: Create `client-documents` bucket (private)

**New edge function: `manage-documents`** — Actions: `list` (user's docs or admin lists by user_id), `upload` (admin only, returns signed URL), `delete` (admin only), `download` (generates signed URL for authorized user)

**`src/pages/Documents.tsx`**: Replace mock data with real document list from edge function. Client can view/download. Filter by document type.

**Admin panel addition in `BackOffice.tsx`**: Add "Documents" tab. Admin can upload documents for any client, assign type, delete.

---

### Phase 4: Deposit System (Admin Controlled)

**Database migration**: Create `deposits` table (id, user_id, amount, currency, reference_code, status, invoice_url, created_at, received_at, created_by)

**New edge function: `manage-deposits`** — Actions: `create` (admin), `list` (user's deposits or admin all), `update-status` (admin marks received/cancelled), `generate-invoice` (admin, creates branded HTML invoice, stores as PDF in storage)

**`src/pages/Deposit.tsx`**: Replace mock bank details. Show client's deposit history and downloadable invoices from `deposits` table.

**Admin panel**: Add "Deposits" tab in BackOffice. Admin can create deposit records, generate invoices, mark as received.

---

### Phase 5: Admin Client Management Enhancement

**Extend `admin-clients` edge function** with new actions:
- `create-client` — Create new `app_users` entry with hashed password, assign role
- `update-client` — Edit client name, email, phone, company, address
- `reset-password` — Generate new password hash, invalidate sessions
- `deactivate-client` — Soft delete or flag

**Update `ClientManagement.tsx`**: Add "Create Client" button, edit client modal, reset password action, deactivate toggle.

---

### Phase 6: FX Heatmap Real Data

**`src/pages/FxHeatmap.tsx`**: Replace `Math.random()` values with real FX rates from `market-data` edge function. The edge function already proxies Finnhub — extend it to fetch forex pairs. Poll every 60 seconds.

**`src/pages/Research.tsx`**: Connect top picks and FX pairs section to same real market data.

---

### Phase 7: Research Publishing System

**Database migration**: Create `research_posts` table (id, title, summary, content, author, image_url, published_at, created_at)

**Extend `admin-clients` or new edge function**: CRUD for research posts (admin only).

**`src/pages/Research.tsx`**: Replace hardcoded `topPicksData` with published research posts from DB.

**Admin panel**: Add "Research" tab in BackOffice for publishing/editing posts.

---

### Phase 8: Client Notes (Admin Only)

**Database migration**: Create `client_notes` table (id, user_id, note, created_by, created_at)

**Add to `admin-clients` edge function**: Actions `add-note`, `list-notes`, `delete-note`.

**UI**: Add notes section in `AdminHoldingsDialog` or a dedicated client detail view.

---

### Phase 9: UI & Stability

- Add React Error Boundary wrapper in `App.tsx`
- Add loading states to all async pages
- Add empty state components for no documents, no deposits, no holdings
- Replace remaining `bg-gray-50` with `bg-muted` semantic tokens

---

### Phase 10: End-to-End Validation

After all phases, test:
- Client login → dashboard shows real data → investments → documents → deposits → settings save
- Admin login → BackOffice stats → client management → create client → manage holdings → upload document → create deposit → generate invoice → publish research → client notes

---

### Files Created
- `supabase/functions/update-profile/index.ts`
- `supabase/functions/revoke-session/index.ts`
- `supabase/functions/manage-documents/index.ts`
- `supabase/functions/manage-deposits/index.ts`

### Files Modified
- `src/pages/Dashboard.tsx` — real data from useHoldings + admin stats
- `src/pages/Settings.tsx` — persist profile, theme, real sessions
- `src/pages/Documents.tsx` — real document storage
- `src/pages/Deposit.tsx` — real deposit records + invoices
- `src/pages/Research.tsx` — real research posts
- `src/pages/FxHeatmap.tsx` — real FX rates
- `src/pages/BackOffice.tsx` — new tabs (Documents, Deposits, Research)
- `src/components/ClientManagement.tsx` — create/edit/deactivate clients
- `src/hooks/useAuth.tsx` — load theme preference
- `src/App.tsx` — error boundary
- `supabase/functions/admin-clients/index.ts` — new actions
- `supabase/functions/market-data/index.ts` — forex pairs support
- `supabase/config.toml` — register new functions

### Database Migrations
1. Add columns to `app_users`: phone, company, address, theme_preference
2. Create `documents` table + RLS
3. Create `deposits` table + RLS
4. Create `research_posts` table + RLS
5. Create `client_notes` table + RLS
6. Create `client-documents` storage bucket


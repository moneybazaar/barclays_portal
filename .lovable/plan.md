

## Add KYC/AML Document Upload & Storage

The existing document system (`manage-documents` edge function + `client-documents` storage bucket + `documents` table) already supports file upload, download, and deletion. We need to extend it for KYC/AML-specific workflows.

### What Changes

#### 1. Add KYC/AML document types to the system

The `documents.doc_type` column is a varchar — no migration needed. Add new types: `kyc_id`, `kyc_address_proof`, `kyc_selfie`, `aml_source_of_funds`, `aml_declaration`.

#### 2. Add KYC status tracking to `app_users`

**Database migration**: Add columns to `app_users`:
```sql
ALTER TABLE app_users ADD COLUMN kyc_status VARCHAR DEFAULT 'pending';
ALTER TABLE app_users ADD COLUMN kyc_reviewed_at TIMESTAMPTZ;
ALTER TABLE app_users ADD COLUMN kyc_reviewed_by UUID;
```

Status values: `pending`, `submitted`, `approved`, `rejected`

#### 3. Client-side KYC upload page

**New file: `src/pages/KycUpload.tsx`**

Client can:
- Upload ID document (passport, driving licence)
- Upload proof of address (utility bill, bank statement)
- Upload selfie for identity verification
- View current KYC status (pending/submitted/approved/rejected)
- See which documents are already submitted

Uses the existing `manage-documents` edge function's `upload` action — but we need to allow **clients** to upload KYC docs (currently upload is admin-only).

#### 4. Update `manage-documents` edge function

Add a new action: `client-kyc-upload` — allows clients to upload only KYC/AML document types to their own folder. This keeps general uploads admin-only while allowing self-service KYC.

The flow:
1. Client calls `client-kyc-upload` with file_name, doc_type (must be kyc_* or aml_*)
2. Edge function creates signed upload URL + document record
3. Client uploads file directly to storage using signed URL
4. Edge function updates `app_users.kyc_status` to `submitted` once docs are uploaded

#### 5. Admin KYC review in BackOffice

Add a "KYC/AML" tab in `BackOffice.tsx`:
- List all clients with their KYC status
- View uploaded KYC documents per client
- Approve or reject KYC with notes
- Admin action calls `admin-clients` edge function with new `update-kyc-status` action

#### 6. Update `admin-clients` edge function

Add action: `update-kyc-status` — sets `kyc_status`, `kyc_reviewed_at`, `kyc_reviewed_by` on `app_users`.

#### 7. Add route

Add `/kyc` route in `App.tsx` and link in `DashboardNav.tsx` for clients.

### Files Created
- `src/pages/KycUpload.tsx`

### Files Modified
- `src/pages/BackOffice.tsx` — KYC/AML review tab
- `src/components/DashboardNav.tsx` — KYC nav link for clients
- `src/App.tsx` — `/kyc` route
- `supabase/functions/manage-documents/index.ts` — `client-kyc-upload` action
- `supabase/functions/admin-clients/index.ts` — `update-kyc-status` action
- `.lovable/plan.md` — updated plan

### Database Migration
- Add `kyc_status`, `kyc_reviewed_at`, `kyc_reviewed_by` columns to `app_users`


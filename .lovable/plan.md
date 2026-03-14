## Plan: Combined Client Onboarding + Email Invites + Docker Deployment

### Status: Part A — ✅ Implemented

#### Completed Items

1. ✅ **Database migration**: Added `salt` (TEXT, NOT NULL, UNIQUE) and `invited_by` (TEXT) columns to `pending_invitations`
2. ✅ **`send-email` edge function**: Provider-agnostic email sender (supports Resend, SMTP, dry-run mode)
3. ✅ **`invite-client` edge function**: Admin generates salt, stores invite, sends branded email with `/apply/{salt}` link
4. ✅ **`register-client` edge function**: Validates salt, creates `app_users` + `app_user_roles`, marks invite used
5. ✅ **`/apply/:code` page**: Multi-step onboarding form (Personal → Financial → Compliance → Security)
6. ✅ **BackOffice Invitations tab**: Send invites, view invitation status table, copy invite links
7. ✅ **Route added** to `App.tsx`
8. ✅ **`admin-clients`** updated with `list-invitations` action
9. ✅ All 4 edge functions deployed

#### Secrets Still Needed (for email delivery)

Email sending currently runs in **dry-run mode** (logged but not sent). To enable actual delivery:
- `EMAIL_PROVIDER` — set to `resend` or `smtp`
- `RESEND_API_KEY` (if using Resend) or `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` + `SMTP_PORT` (if using SMTP)

Invite links still work without email — admins can copy the link from the Invitations tab.

---

### Part B — Docker Production Deployment (Reference Only)

This section is for VPS deployment and is NOT implemented in Lovable code.

#### Architecture

```
Lovable Cloud (backend)
├── Edge Functions (login, validate-session, invite-client, send-email, register-client, admin-clients, etc.)
└── Database (app_users, pending_invitations, holdings, deposits, etc.)

VPS + Cloudflare (frontend serving)
├── secure.barclays-ib.app → portal-app container (Nginx serving Vite dist/)
├── bonds.barclays-ib.app → bonds-app container
└── Cloudflare Worker → X-Salt-Hash header extraction for /secure/{salt}
```

#### Dockerfile (portal — static Vite SPA)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

#### Docker Compose Service

```yaml
portal-app:
  build:
    context: ./portal
    args:
      VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
      VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY}
      VITE_SUPABASE_PROJECT_ID: ${VITE_SUPABASE_PROJECT_ID}
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
    interval: 30s
    timeout: 5s
    retries: 3
  networks:
    - app-network
```

#### Cloudflare Worker

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
async function handleRequest(request) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/secure\/([a-zA-Z0-9_-]+)/);
  if (match) {
    const headers = new Headers(request.headers);
    headers.set('X-Salt-Hash', match[1]);
    return fetch(new Request(request, { headers }));
  }
  return fetch(request);
}
```

---

### Previous Plan Items (from initial plan)

These items from the original plan remain relevant:

- ✅ `role` support via `app_user_roles` table (already implemented)
- ✅ Test accounts seeded (client@yopmail.com, admin@yopmail.com)
- ✅ `useAuth.tsx` reads role from validate-session
- ✅ Market data fallback prices fixed
- ✅ 2FA removed from Settings
- ✅ Dashboard `/research` link fixed
- ✅ Settings uses logged-in user data
- ✅ Holdings managed via edge functions (bypassing RLS)

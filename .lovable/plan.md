

## Combined Plan: Client Onboarding + Email Invites + Docker Production Deployment

### Part A — Lovable Code Changes (what we build here)

#### 1. Database Migration

Add columns to `pending_invitations` and ensure the table supports the invite flow:

```sql
ALTER TABLE pending_invitations ADD COLUMN IF NOT EXISTS salt TEXT NOT NULL DEFAULT '';
ALTER TABLE pending_invitations ADD COLUMN IF NOT EXISTS invited_by TEXT;
ALTER TABLE pending_invitations ADD CONSTRAINT pending_invitations_salt_unique UNIQUE (salt);
```

#### 2. Edge Functions

| Function | Purpose |
|----------|---------|
| `send-email` | Provider-agnostic email sender (reads `EMAIL_PROVIDER` secret: `resend`, `zoho`, or `smtp`) |
| `invite-client` | Admin generates salt, stores invite, triggers branded email with link to `/apply/{salt}` |
| `register-client` | Validates salt, creates `app_users` + `app_user_roles`, marks invite used |

**`send-email`** routes to the correct provider based on secrets. Initially supports Resend (`RESEND_API_KEY`) and SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`). Easily extensible.

**`invite-client`** validates admin session, generates `crypto.randomUUID()` salt, inserts into `pending_invitations`, calls `send-email` with branded HTML containing link: `https://iportal.barclays-ib.app/apply/{salt}`.

**`register-client`** validates the salt (not expired, not used), creates user with hashed password, assigns `client` role, marks invitation `used`.

#### 3. New Page: `/apply/:code`

Multi-step form (no auth required):
- Step 1: Personal (name, email pre-filled, phone, nationality, DOB, address)
- Step 2: Financial (employment, income range, source of funds)
- Step 3: Compliance (tax ID, PEP declaration)
- Step 4: Set password

Submits to `register-client` edge function. On success, redirects to `/login`.

#### 4. BackOffice: Invitations Tab

New tab in BackOffice with:
- Send invite form (email + name)
- Invitations table (status, sent date, used date)
- Quick actions: copy link, resend, revoke

#### 5. Route Update

Add `/apply/:code` to `App.tsx` as a public route.

---

### Part B — Docker Production Deployment (reference configs, not Lovable code)

This app is a **static Vite SPA** — no Node.js server needed. The built output (`dist/`) is served by Nginx. Edge functions remain on Lovable Cloud.

#### Dockerfile (portal)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

**`nginx-spa.conf`** (inside portal container):
```nginx
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    location /health {
        return 200 '{"status":"ok"}';
        add_header Content-Type application/json;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Backend API endpoint (build-time only) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key (build-time only) |
| `VITE_SUPABASE_PROJECT_ID` | Project ID (build-time only) |
| `DATABASE_URL` | For bonds-app or any SSR container (not needed for this SPA) |
| `SESSION_SECRET` | Used by edge functions (already configured in Lovable Cloud) |

Since this is a Vite SPA, env vars are baked in at **build time** via `ARG`. No runtime env needed for the portal container itself.

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

No ports exposed — accessed only via the Nginx reverse proxy.

#### X-Salt-Hash Handling

The salt header is set by a **Cloudflare Worker** before requests reach the origin. The SPA reads it client-side from the URL path (`/apply/:code` or `/secure/:salt`) — not from HTTP headers. The Cloudflare Worker is useful for server-side containers (bonds-app) but the SPA uses React Router params directly.

#### Cloudflare Worker (reference)

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

#### Local Testing

```bash
# Build
docker build -t portal-app \
  --build-arg VITE_SUPABASE_URL=https://axinziollxrrncuukhql.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  --build-arg VITE_SUPABASE_PROJECT_ID=axinziollxrrncuukhql \
  ./portal

# Run
docker run -p 3000:3000 portal-app

# Test
curl http://localhost:3000/health
# Open http://localhost:3000 in browser
```

---

### Implementation Order

1. Database migration (add `salt`, `invited_by` to `pending_invitations`)
2. Create `send-email` edge function
3. Create `invite-client` edge function
4. Create `register-client` edge function
5. Build `/apply/:code` page
6. Add Invitations tab to BackOffice
7. Add route to `App.tsx`
8. Request email provider secrets from user

### Secrets Needed

Before email sending works, you will need to provide:
- `EMAIL_PROVIDER` — `resend` or `smtp`
- `RESEND_API_KEY` (if using Resend) or `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS` (if using SMTP via mail.barclays-ib.com)

### Files

| File | Action |
|------|--------|
| DB migration | Add `salt`, `invited_by` columns |
| `supabase/functions/send-email/index.ts` | New |
| `supabase/functions/invite-client/index.ts` | Update existing |
| `supabase/functions/register-client/index.ts` | New |
| `src/pages/Apply.tsx` | New |
| `src/App.tsx` | Add route |
| `src/pages/BackOffice.tsx` | Add Invitations tab |

Docker configs (Dockerfile, nginx-spa.conf, Cloudflare Worker) are reference documents for VPS deployment — not committed to the Lovable project.


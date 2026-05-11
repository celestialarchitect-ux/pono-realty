# Activating the Backend Layer

The code is shipped. To make the multi-user admin portal, transactional email,
password reset, and Stripe checkout fully real, configure Railway env vars and
external accounts below. Total setup time: ~20 minutes.

## Layer 1 — Database + Session (required for everything else)

### 1.1 Provision Postgres on Railway
1. Railway project → **+ New** → **Database** → **Add PostgreSQL**.
2. `DATABASE_URL` injects automatically into the `pono-realty` service.

### 1.2 Set core auth env vars
On the `pono-realty` service → **Variables**:

| Name             | Value                                                          |
|------------------|----------------------------------------------------------------|
| `SESSION_SECRET` | 32+ char random string (`openssl rand -hex 32`)                |
| `ADMIN_EMAILS`   | Comma-separated emails that become admin on signup             |
| `SITE_URL`       | `https://ralphfoulger.com` (or the Railway URL until domain)   |

### 1.3 Create database tables (one-time)
```bash
cd ~/claude-dashboard/ralph-foulger-school
railway link    # if not already linked
railway run npm run db:push
```

Expected: `🚀 Your database is now in sync with your Prisma schema.`

### 1.4 Smoke test
- `/signup` → create an admin-listed account with a 10+ char password
- Redirects to `/profile` → should show 0.0 hours, source: server
- Visit `/admin` → Shopify-style dashboard with KPIs + 30-day chart
- Visit `/admin/users` → real student table with your row

### 1.5 Creating the first admin via CLI (alternative to ADMIN_EMAILS)

If you'd rather not go through the signup form, run:

```bash
cd ~/claude-dashboard/ralph-foulger-school
railway run npm run create-admin -- you@email.com 'YourPassword123!' "Your Name"
```

This script:
- Creates the user if they don't exist, with `isAdmin=true` and a verified email
- Or promotes an existing user to admin if the email is already in the DB
- Pass `--reset-password` to also rewrite the password for an existing user

After it runs, visit `/login`, sign in, and you're dropped into `/admin`.

---

## Layer 2 — Transactional email (verify + reset + welcome)

Without email, signup still works but the verification banner stays visible
and `/forgot-password` silently no-ops.

### 2.1 Create a Resend account
1. https://resend.com → sign up (free tier covers 100 emails/day, 3,000/month).
2. Add your domain `ralphfoulger.com` → add the DNS records Resend shows.
3. Once verified, create an **API key** (Full access for now).

### 2.2 Set email env vars

| Name             | Value                                                          |
|------------------|----------------------------------------------------------------|
| `RESEND_API_KEY` | `re_…` from the Resend dashboard                               |
| `EMAIL_FROM`     | `Ralph Foulger Academy <noreply@ralphfoulger.com>`             |
| `EMAIL_REPLY_TO` | `support@ralphfoulger.com`                                     |

### 2.3 Smoke test
- Sign up with a fresh email → verification email arrives
- Click the link → lands on `/verify-email?status=ok`
- `/profile` no longer shows the "verify your email" banner
- Trigger `/forgot-password` → reset email arrives → `/reset-password` works

### 2.4 Without Resend (dev mode)
The email helper logs the would-have-sent template + verify/reset link to the
server console. Tail Railway logs to grab the link manually during dev.

---

## Layer 3 — Stripe checkout (paid tier upgrades)

Without Stripe, the pricing CTAs return a friendly "checkout not yet
configured" message.

### 3.1 Stripe products
In the Stripe Dashboard → **Products** → create three one-time products:

| Product                        | Price  | Notes                                |
|--------------------------------|--------|--------------------------------------|
| Standard — Pre-License Course  | $599   | One-time, USD                        |
| Plus — Course + Website Bundle | $899   | One-time, USD                        |
| Solo Website Build             | $800   | One-time, USD                        |

Copy each Price ID (begins with `price_…`).

### 3.2 Set Stripe env vars

| Name                       | Value                                                          |
|----------------------------|----------------------------------------------------------------|
| `STRIPE_SECRET_KEY`        | `sk_test_…` (test mode) or `sk_live_…`                         |
| `STRIPE_PRICE_STANDARD`    | `price_…` for the Standard product                             |
| `STRIPE_PRICE_PLUS`        | `price_…` for the Plus product                                 |
| `STRIPE_PRICE_SOLO`        | `price_…` for the Solo Website Build                           |

### 3.3 Wire the webhook
1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
2. URL: `https://ralphfoulger.com/api/stripe/webhook` (or Railway URL pre-domain).
3. Events to send: `checkout.session.completed` (minimum); optionally
   `payment_intent.payment_failed` for failure surfacing later.
4. Save → copy the **Signing secret** (`whsec_…`).
5. Add env var on Railway:

| Name                    | Value         |
|-------------------------|---------------|
| `STRIPE_WEBHOOK_SECRET` | `whsec_…`     |

### 3.4 Smoke test
- Sign in to the site
- Visit `/pricing` → click any tier → redirects to Stripe Checkout
- Use a Stripe **test card** (`4242 4242 4242 4242`) to complete the purchase
- Redirects to `/checkout/success` → polls `/api/auth/me` → tier updates within
  ~2 seconds
- Welcome email arrives (if Resend is configured)
- Check `/admin/users` → user's tier column reflects the upgrade

### 3.5 Going live
1. Toggle Stripe Dashboard from **Test** to **Live**.
2. Regenerate `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as live values.
3. Recreate the live products and update the three `STRIPE_PRICE_*` env vars.
4. Update the webhook endpoint to the live mode.

---

## Full env-var manifest

```
# Core
DATABASE_URL=postgresql://...                  # auto-injected by Railway
SESSION_SECRET=<32+ char random>
ADMIN_EMAILS=zach@trinitycommand.io,ralph@...
SITE_URL=https://ralphfoulger.com

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=Ralph Foulger Academy <noreply@ralphfoulger.com>
EMAIL_REPLY_TO=support@ralphfoulger.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STANDARD=price_...
STRIPE_PRICE_PLUS=price_...
STRIPE_PRICE_SOLO=price_...

# AI tutor (already pending)
ANTHROPIC_API_KEY=sk-ant-...
```

## Graceful-degradation matrix

| Missing env var(s) | What still works | What breaks gracefully |
|---|---|---|
| All of Layer 1 | Per-device localStorage tracking, 3 mock exams, full content | `/signup`, `/login`, `/admin/users` show "not provisioned" |
| Layer 1 only | Accounts, sessions, server-side time, admin lookup | `/forgot-password`, verify emails silently no-op |
| Layer 1+2 | Above + email | `/pricing` CTAs show "checkout not configured" |
| All three | Everything wired end-to-end | — |

No layer ever crashes the site. You can flip them on in any order.

## Operational notes

- **Resetting an admin after the fact**: `railway run npx prisma studio` → flip `isAdmin`.
- **Rotating SESSION_SECRET**: invalidates all active sessions; safe, no data loss.
- **Rotating STRIPE_WEBHOOK_SECRET**: only Stripe needs to know the new value; rotate in Stripe Dashboard.
- **Email deliverability**: Resend requires verified domain DNS (SPF + DKIM). Without verification, only emails to your own Resend account address will deliver.

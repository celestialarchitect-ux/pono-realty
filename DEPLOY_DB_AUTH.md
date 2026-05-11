# Activating the DB + Auth Layer

The code is shipped. To make the multi-user admin portal real, three Railway
side-effects are needed. Total time: ~5 minutes.

## 1 · Provision Postgres on Railway

1. Open the Railway project: `https://railway.com/project/3dea793e-1c94-453e-bc70-6711fcab748d`
2. Click **+ New** → **Database** → **Add PostgreSQL**.
3. Railway provisions a Postgres service and auto-injects `DATABASE_URL` into
   the `pono-realty` service's env.
4. No further action — the URL is shared automatically.

## 2 · Add the auth env vars

In the `pono-realty` service → **Variables**, add:

| Name             | Value                                                          | Notes |
|------------------|----------------------------------------------------------------|-------|
| `SESSION_SECRET` | 32+ char random string (`openssl rand -hex 32`)                | Signs the session JWT. Rotating invalidates every active session. |
| `ADMIN_EMAILS`   | `zach@trinitycommand.io,ralph@…` (comma-separated)             | Whoever signs up with these emails becomes admin on creation. |

Optional but recommended:

| Name              | Value                                              |
|-------------------|----------------------------------------------------|
| `SITE_URL`        | `https://ralphfoulger.com` once the domain wires up |
| `ANTHROPIC_API_KEY` | already-pending — same env for the AI Tutor       |

## 3 · Create the database tables

After the env vars are saved, run **once** from your local terminal:

```bash
cd ~/claude-dashboard/ralph-foulger-school
railway link    # if not already linked
railway run npm run db:push
```

Expected output:

```
🚀  Your database is now in sync with your Prisma schema.
```

This creates the `User` and `TimeEvent` tables. Future schema changes follow
the same pattern (per project rules: `prisma db push`, never `prisma migrate`).

## 4 · Smoke test

1. Visit `https://pono-realty-production.up.railway.app/signup`.
2. Sign up using an email from `ADMIN_EMAILS` and a 10+ char password.
3. You're redirected to `/profile` — should show 0.0 hours, source: server.
4. Click around the site for a minute — refresh `/profile` — hours should tick up.
5. Visit `/admin/users` — you should see your own row in a real table.

## What happens BEFORE step 3 is run

- `/signup` and `/login` return `503` with a friendly "not yet provisioned" message.
- `/profile` falls back to localStorage (existing per-device tracking).
- `/admin/users` shows the "Backend not yet provisioned" notice.
- `/practice` uses localStorage for the 60-hour gate.

No crashes. The site keeps working for visitors regardless of Postgres state.

## Resetting an admin

If you need to make someone admin AFTER they've already signed up:

```bash
railway run npx prisma studio
```

Opens a local UI to the Railway database. Find the user, flip `isAdmin` to true.

## Rotating SESSION_SECRET

Changing `SESSION_SECRET` invalidates all active sessions — everyone signs in
again on next visit. Safe to do; no data loss.

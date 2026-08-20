# Chelsea Supporters Club UAE

Official supporters club app for Chelsea fans in the UAE — fixtures, RSVPs, The Vault, membership card, and club perks.

## Stack

- [Vite](https://vitejs.dev/) static app
- [Supabase](https://supabase.com/) — auth (anonymous), fixtures, RSVPs, vault, notices, perks, trips
- Deployed on [Vercel](https://vercel.com/)

## Setup

1. **Supabase** — run migrations in order in the SQL Editor:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_seed_content.sql`
   - `supabase/migrations/003_update_vault_and_fixtures.sql`
2. **Auth** — enable **Anonymous sign-ins** in Supabase → Authentication → Providers.
3. **Env** — copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

```bash
npm install
npm run dev
```

## Deploy (Vercel)

Connect the repo and add the same env vars. `vercel.json` rewrites all routes to the SPA.

## Fixtures

Seeded from [fixtur.es Chelsea calendar](https://fixtur.es/en/team/chelsea). Update `fixtures` in Supabase as the season progresses.

## Payment

Stripe is not wired yet. Join flow creates a profile with `payment_status = pending` and shows the digital membership card. Copy in the app reads “payment link coming soon.”

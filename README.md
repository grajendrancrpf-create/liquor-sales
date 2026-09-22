# LendTrack — Lending Manager for Indian Lenders

A mobile-first lending management web app. Track loans, record principal/interest
payments, generate EMI schedules, and see your whole portfolio at a glance — with
Indian formatting (₹ with lakh/crore grouping, DD/MM/YYYY dates, +91 phones).

**Stack:** Vite + React + TypeScript · Supabase (Auth + Postgres) · no other backend.

## Features

- **Auth** — email/password sign up, login, logout (Supabase Auth); all routes protected
- **Dashboard** — total disbursed, principal outstanding, interest due/collected, charges, active/closed counts
- **Loans** — searchable list with Active/All/Closed filters; add/edit loans with client name, +91 phone, PAN (validated), loan type, principal, interest rate (monthly/annual/flat), disbursement date, tenure, EMI toggle with reducing-balance calculation, status, notes
- **Ledger** — chronological entries per loan (disbursement, principal payment, interest payment, charge, adjustment); add/edit/delete; global activity feed across all loans
- **EMI** — per-loan amortisation schedule + standalone EMI calculator; "Mark EMI paid" posts principal + interest ledger entries automatically
- **Mobile-native feel** — bottom tab bar (Home, Loans, Add, Activity, Settings), 480px app column on desktop, touch-friendly controls

## Setup

### 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account + project.
2. In the Supabase dashboard, open **SQL Editor → New query**.
3. Paste the entire contents of [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) and run it. This creates the `profiles`, `loans`, and `ledger_entries` tables, enables Row Level Security (each user only sees their own rows), and adds a trigger that auto-creates a profile row on signup.
4. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.

### 2. Configure the app

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, sign up, and start adding loans.

### 4. Build

```bash
npm run build   # outputs to dist/
```

## Deploy

### Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` is included for SPA routing.

### Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**.
3. Build command `npm run build`, publish directory `dist`.
4. Add the two `VITE_SUPABASE_*` environment variables. `netlify.toml` is included for SPA routing.

### Custom domain

- **Vercel:** Project → Settings → Domains → add your domain, then point your DNS at Vercel (A/CNAME records shown in the dashboard).
- **Netlify:** Site settings → Domain management → Add custom domain, then point your DNS at Netlify.

## Notes

- Auth uses email/password. If sign-up requires email confirmation and you don't receive the mail, disable "Confirm email" under Supabase **Authentication → Providers → Email** for testing.
- All money math happens client-side from your ledger; the database stores principals, rates, and entries.

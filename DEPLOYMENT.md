# Deployment (Side-project friendly)

This repo is a monorepo:

- **Backend**: NestJS + Prisma + Postgres (repo root, `src/`)
- **Frontend**: Next.js app (in `frontend/`)

It also uses:

- **Clerk** (auth)
- **Cloudinary** (images)
- **Resend** (email invites)

## Recommended default (easy now, scales nicely)

- **Frontend**: Vercel
- **Backend**: Railway (Node service)
- **Database**: Railway Postgres

Backup alternative (also excellent):

- **Frontend**: Vercel
- **Backend**: Fly.io (Docker/Node app)
- **Database**: Neon Postgres (same region as Fly)

Suggested domains:

- `app.yourdomain.com` → Vercel (Next.js)
- `api.yourdomain.com` → Railway (NestJS)

## Environment variables (production)

### Backend (Railway)

Required:

- `DATABASE_URL` (Railway provides this for Postgres)
- `CLERK_SECRET_KEY`
- `FRONTEND_URL` (your Vercel production domain or `https://app.yourdomain.com`)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (e.g. `survivor/castaways`)
- `RESEND_API_KEY`
- `FROM_EMAIL` (use a verified domain for best deliverability)

Provided by platform:

- `PORT` (Railway sets this automatically; backend already uses it)
- `NODE_ENV` (optional; Railway sets or you can set to `production`)

Local example: see `/.env.example`.

### Frontend (Vercel)

Required:

- `NEXT_PUBLIC_API_URL` (e.g. `https://api.yourdomain.com`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY` (server-side for Clerk Next.js)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Local example: see `frontend/.env.local.example`.

## Deploy frontend to Vercel

1. Import the repo into Vercel.
2. Configure project root to `frontend/` (or keep it at repo root and rely on `vercel.json`).
3. Set Vercel environment variables (Production + Preview if you want previews to work).
4. Set `NEXT_PUBLIC_API_URL` to the deployed API base URL (Railway service URL or your `api.` domain).
5. In Clerk dashboard (production instance), add your Vercel domains to allowed origins/redirect URLs.

Suggested Vercel env vars:

- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
- `CLERK_SECRET_KEY=sk_live_...`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=survivor_team_logos`

Notes:

- This repo includes `vercel.json` which builds from `frontend/`.

## Deploy backend + Postgres to Railway

1. Create a new Railway project from GitHub.
2. Add a **PostgreSQL** plugin/database.
3. Create a **Service** for the backend (repo root).
4. Configure build + deploy (recommended: use config-as-code via `railway.json`):
   - **Build command**: `npm ci && npm run build:backend`
   - **Pre-deploy command**: `npx prisma migrate deploy`
   - **Start command**: `node dist/main`
5. Set backend environment variables (see list above).
6. Set `FRONTEND_URL` to your stable Vercel production domain (or `https://app.yourdomain.com`) to satisfy CORS.

Suggested Railway env vars:

- `DATABASE_URL` (from Railway Postgres)
- `FRONTEND_URL=https://app.yourdomain.com`
- `CLERK_SECRET_KEY=sk_live_...`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`
- `CLOUDINARY_FOLDER=survivor/castaways`
- `RESEND_API_KEY=re_...`
- `FROM_EMAIL=noreply@yourdomain.com`

## Prisma production workflow (recommended)

You want a repeatable schema history in production:

- **Commit migrations**: `prisma/migrations/` should be in git (this repo now allows that).
- **Apply migrations in prod**: run `npx prisma migrate deploy` during deploy/release.

Suggested approach:

1. Locally (with a dev DB), whenever the schema changes:
   - `npx prisma migrate dev --name <change_name>`
2. Commit:
   - `prisma/migrations/**`
   - `prisma/schema.prisma`
3. In production, on release:
   - `npx prisma migrate deploy`

If you’re currently using `prisma db push` in development, do a one-time switch:

- create an initial migration with `prisma migrate dev --name init`
- then use migrations going forward.

Why this matters:

- it prevents “works on my machine” schema drift
- it makes rollouts repeatable across providers (Railway/Render/Fly/AWS)

## Common “gotchas” for this codebase

- **CORS**: backend allows exactly one origin from `FRONTEND_URL` (`src/main.ts`). If you rely on Vercel preview URLs, either use a stable domain for testing or later update CORS to allow multiple origins.
- **Secrets in logs**: `src/auth/clerk.service.ts` currently logs part of `CLERK_SECRET_KEY`. Remove before a public launch.


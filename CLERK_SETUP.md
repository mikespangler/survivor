# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your Survivor Fantasy League app.

## Prerequisites

1. A Clerk account (sign up at https://clerk.com)
2. PostgreSQL database running (via docker-compose)

## Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Add application"
3. Name it "Survivor Fantasy League" (or any name you prefer)
4. Enable Google OAuth provider:
   - Go to "User & Authentication" → "Social Connections"
   - Enable Google
   - Configure OAuth credentials (Clerk provides test credentials for development)

## Step 2: Get Your API Keys

From your Clerk dashboard:
1. Go to "API Keys"
2. Copy your keys

## Step 3: Configure Environment Variables

### Backend (.env in root directory)

Create or update `/Users/mike/code/survivor/.env`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/survivor"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"

# Server Configuration
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

### Frontend (.env.local in frontend directory)

Create `/Users/mike/code/survivor/frontend/.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"

# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Step 4: Start Your Applications

```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
# Backend (from root)
npm run dev:backend

# Frontend (from root or frontend directory)
npm run dev:frontend
```

## Step 5: Test the Authentication Flow

1. Open http://localhost:3001 in your browser
2. Click "Get Started" or "Sign In"
3. Sign in with Google (or create an account with email)
4. You should see your name in the navigation bar
5. The user will be automatically created in your PostgreSQL database on first login (Just-in-Time sync)

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"** → Clerk handles the OAuth flow
2. **Clerk issues JWT** → Stored in browser
3. **Frontend makes API request** → Includes JWT in Authorization header
4. **NestJS backend verifies JWT** → Using Clerk SDK
5. **Just-in-Time User Sync** → User created/updated in Postgres on first request
6. **Request proceeds** → With authenticated user data

### Role-Based Access Control (RBAC)

#### System Roles
- **user** (default) - Regular player
- **admin** - God-mode access to all leagues and system features

#### League Roles
- **League Owner** - Set via `League.ownerId` (commissioner)
- **League Member** - User in `League.members` array

#### Guards Available

1. **Global AuthGuard** - Applied to all routes by default
2. **@Public()** decorator - Mark routes as public
3. **@SystemAdmin()** guard - Requires systemRole === 'admin'
4. **@LeagueOwnerOrAdmin()** guard - Requires league ownership OR system admin

### Making a User a System Admin

```bash
# Connect to your database
psql postgresql://postgres:postgres@localhost:5434/survivor

# Update a user's role
UPDATE "User" SET "systemRole" = 'admin' WHERE email = 'your@email.com';
```

## Troubleshooting

### "Unauthorized" errors
- Check that your Clerk keys are correct in both .env files
- Make sure you're signed in on the frontend
- Check browser console for JWT token issues

### User not created in database
- Check backend logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations are applied

### CORS errors
- Verify FRONTEND_URL in backend .env matches your Next.js port
- Check that CORS is enabled in src/main.ts

## Security Notes

- Never commit .env files to git
- Use different Clerk applications for development and production
- Keep your Clerk secret keys secure
- For production, use Clerk's webhook-based sync for better reliability

## Next Steps

- Set up Clerk webhooks for production (optional)
- Configure custom Clerk themes to match your brand
- Add role-based UI components (show/hide features based on role)
- Implement league invitation system


# Survivor League Frontend

A Next.js 14 frontend application for the Survivor Fantasy League platform.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the `NEXT_PUBLIC_API_URL` to point to your backend API:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Landing page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   └── Navigation.tsx
│   ├── lib/             # Utility functions
│   │   └── api.ts       # API client
│   └── types/           # TypeScript types
│       └── api.ts       # API type definitions
├── public/              # Static assets
└── package.json
```

## API Integration

The frontend communicates with the NestJS backend via the API client in `src/lib/api.ts`. The base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable.

Example usage:

```typescript
import { api } from '@/lib/api';

// Fetch all users
const users = await api.getUsers();

// Create a new league
const league = await api.createLeague({
  name: 'My League',
  description: 'A fun league with friends'
});
```

## Authentication

Authentication will be integrated using [Clerk](https://clerk.com/) in a future update.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure the root directory to point to `frontend`
4. Set the `NEXT_PUBLIC_API_URL` environment variable
5. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

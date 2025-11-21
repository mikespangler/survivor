# Survivor Fantasy League

A full-stack fantasy league application for Survivor fans. Build leagues, draft castaways, and compete with friends while watching your favorite reality show.

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

### Frontend
- **Next.js 14** - React framework with App Router
- **React 19** - UI library
- **Chakra UI** - Component library
- **TypeScript** - Type safety

## Project Structure

```
survivor/
├── src/                 # NestJS backend source
├── prisma/             # Database schema and migrations
├── frontend/           # Next.js frontend application
├── test/               # Backend tests
└── dist/               # Compiled backend code
```

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher (recommended)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd survivor
```

2. Install backend dependencies:

```bash
npm install
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

4. Set up environment variables:

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/survivor"
```

Create a `frontend/.env.local` file (copy from `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Set up the database:

```bash
npx prisma migrate dev
```

### Development

Run both frontend and backend together:

```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

#### Run services individually:

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

### Building for Production

Build both applications:

```bash
npm run build
```

Build individually:

```bash
npm run build:backend
npm run build:frontend
```

## Available Scripts

### Root Directory (Backend + Frontend)

- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:backend` - Run backend in watch mode
- `npm run dev:frontend` - Run frontend dev server
- `npm run build` - Build both applications
- `npm run build:backend` - Build backend only
- `npm run build:frontend` - Build frontend only
- `npm run start:prod` - Start backend in production mode
- `npm run test` - Run backend tests
- `npm run lint` - Lint backend code

### Frontend Directory

See `frontend/README.md` for frontend-specific commands.

## Database

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - Application users
- **League** - Fantasy leagues created by users
- **Season** - Survivor seasons
- **LeagueSeason** - Join table linking leagues to seasons
- **Team** - User teams within a league season
- **Castaway** - Survivor contestants
- **Episode** - Season episodes

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## API Documentation

The backend API runs on port 3001 by default. Key endpoints:

- `GET /user` - List all users
- `POST /user` - Create a new user
- `GET /user/:id` - Get user by ID
- `PATCH /user/:id` - Update user
- `DELETE /user/:id` - Delete user

Additional endpoints for leagues, seasons, teams, and castaways will be added as features are developed.

## Deployment

### Backend

The NestJS backend can be deployed to any Node.js hosting platform:
- Railway
- Render
- Heroku
- AWS/GCP/Azure

### Frontend

The Next.js frontend is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import project in Vercel
3. Configure build settings to point to `frontend` directory
4. Set environment variables
5. Deploy!

See `vercel.json` for deployment configuration.

## Authentication

Authentication will be implemented using [Clerk](https://clerk.com/) in a future update.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

UNLICENSED - Private project

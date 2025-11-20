# Survivor - NestJS API

A NestJS application with PostgreSQL database using Prisma ORM.

## Description

This is a RESTful API built with NestJS, PostgreSQL, and Prisma. It includes a User module with full CRUD operations, global validation, and Docker setup for local development.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Relational database
- **Prisma** - Modern database ORM
- **Docker** - Containerization for local development
- **TypeScript** - Type-safe development
- **class-validator** - Request validation
- **class-transformer** - Object transformation

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## Project Setup

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy the example environment file and update if needed:

```bash
cp .env.example .env
```

The default configuration connects to the PostgreSQL container defined in `docker-compose.yml`.

3. **Start the PostgreSQL database**

```bash
docker-compose up -d
```

This will start a PostgreSQL 16 container on port 5432.

4. **Run database migrations**

```bash
npx prisma migrate dev --name init
```

This creates the database schema based on `prisma/schema.prisma`.

5. **Generate Prisma Client**

```bash
npx prisma generate
```

## Running the Application

```bash
# development mode
npm run start

# watch mode (recommended for development)
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create a new user |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get a user by ID |
| PATCH | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |

### Example Requests

**Create User**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```

**Get All Users**
```bash
curl http://localhost:3000/users
```

**Get User by ID**
```bash
curl http://localhost:3000/users/{id}
```

**Update User**
```bash
curl -X PATCH http://localhost:3000/users/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe"}'
```

**Delete User**
```bash
curl -X DELETE http://localhost:3000/users/{id}
```

## Database Management

### View Database with Prisma Studio

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`

### Create a New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Project Structure

```
src/
├── main.ts                 # Application entry point with global pipes
├── app.module.ts           # Root module
├── app.controller.ts       # Root controller
├── app.service.ts          # Root service
├── prisma/
│   ├── prisma.module.ts    # Prisma module (global)
│   └── prisma.service.ts   # Prisma service with lifecycle hooks
└── user/
    ├── user.module.ts      # User module
    ├── user.controller.ts  # User REST endpoints
    ├── user.service.ts     # User business logic
    └── dto/
        ├── create-user.dto.ts  # User creation DTO with validation
        └── update-user.dto.ts  # User update DTO (partial)
```

## Docker Commands

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down

# View container logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker exec -it survivor-postgres psql -U postgres -d survivor
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/survivor?schema=public` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `survivor` |
| `POSTGRES_PORT` | Database port | `5432` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `development` |

## Features

- **Global Validation**: Automatic request validation using class-validator
- **Error Handling**: Standardized error responses
- **Type Safety**: Full TypeScript support with Prisma
- **Database Migrations**: Version-controlled database schema
- **Docker Support**: Easy local development setup
- **Module Architecture**: Scalable and maintainable code organization
- **Automatic Timestamps**: All models include createdAt and updatedAt fields

## Database Conventions

### Timestamp Fields

**All Prisma models must include automatic timestamp fields:**

```prisma
model YourModel {
  id        String   @id @default(uuid())
  // ... your fields here ...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- `createdAt DateTime @default(now())` - Automatically set when a record is created
- `updatedAt DateTime @updatedAt` - Automatically updated whenever a record is modified

This convention ensures consistent audit trails across all database entities.

## Development Tips

1. **Auto-reload**: Use `npm run start:dev` for automatic restart on file changes
2. **Database GUI**: Use `npx prisma studio` to visually inspect and edit data
3. **Type Generation**: Run `npx prisma generate` after schema changes
4. **Linting**: Run `npm run lint` to check code quality

## License

This project is [MIT licensed](LICENSE).

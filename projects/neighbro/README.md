# Neighbro

Neighbro is a web application for discovering and organizing local community events. Users can create events tied to a geographic location, browse and filter nearby events on a map, and join gatherings happening in their neighborhood.

## Table of Contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [API overview](#api-overview)
- [Database schema](#database-schema)
- [Development](#development)
- [Production build](#production-build)
- [Internal documentation](#internal-documentation)
- [Elevator pitch](#elevator-pitch)

## Tech stack

### Infrastructure

The project is a pnpm monorepo with frontend and backend as separate workspaces. The database runs in Docker during development. A multi-stage Dockerfile is included for production builds, and Kubernetes manifests live in `devops/k8s/`.

### Frontend

The frontend is a React app built using Vite and TypeScript.

- TanStack Router for file-based client-side routing
- TanStack Query for server state and data fetching
- Tailwind CSS for styling
- Leaflet and React Leaflet for interactive maps
- Zustand for global state management
- React Hook Form and Zod for form handling and validation

### Backend

The backend is an Express 5 server written in TypeScript, connected to a PostgreSQL database.

- Drizzle ORM for type-safe queries and schema management
- JSON Web Tokens for authentication
- bcrypt for password hashing
- express-rate-limit for rate limiting
- prom-client for Prometheus metrics

## Project structure

```sh
.                           # ROOT BABY!
├── frontend/               # FrontyMcFronty stuff!
│   └── src/
│       ├── api/            # API client functions
│       ├── assets/         # Static assets
│       ├── components/     # Shared UI components
│       ├── routes/         # TanStack Router pages
│       ├── stores/         # Zustand state stores
│       ├── types/          # Shared types
│       └── utils/          # Utility functions
├── backend/                # BackyMcBacky stuff!
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── database/       # Drizzle schema and connection
│   │   ├── middleware/     # Auth, error handling, metrics
│   │   ├── routes/         # Route city!
│   │   ├── types/          # Shared types
│   │   └── utils/          # Utility functions, such as a very neat email regex lol
│   └── docker-compose.yaml
├── docs/                   # Internal documentation
├── devops/                 # Docker utilities and Kubernetes manifests
└── Dockerfile              # Build the damn thing!
```

## Prerequisites

- Node.js 22+
- pnpm
- Docker, OrbStack, or Podman (for the database)

## Getting started

Remember to install dependencies before you go. Make sure to run the commands from the root folder.

```sh
pnpm install
```

### Environment variables

Create a `.env` file in `backend/` fodlder with the required variables Use the .env.example as a template, or simply remove ".example" from it to hit the ground running!

### Start the database and backend

From the `backend/` directory:

```sh
pnpm run server
```

Starts the PostgreSQL container and the dev server. Make sure to have OrbStack, Podman or Docker running first.

### Push the database schema

From the `backend/` directory:

```sh
pnpm run db:push
```

### Start the development server

Run `pnpm run dev` from the project root to start both frontend and backend. If you do that, you must start the Docker container manually!

## API overview

The base URL for the backend dev server is `http://localhost:3000`. All endpoints except `/api/health` and those under `/api/auth/` require an `Authorization: Bearer <token>` header.

### Authentication

#### Sign up

Send a POST request to `/api/auth/sign-up`.

#### Sign in

Send a POST request to `/api/auth/sign-in`. Returns a JWT token.

### Current user

#### Get current user

Send a GET request to `/api/me`. Returns the profile of the authenticated user.

### Users

#### Get all users

Send a GET request to `/api/users`.

#### Get a specific user

Send a GET request to `/api/users/:id`.

#### Replace all user fields

Send a PUT request to `/api/users/:id`.

#### Update specific user fields

Send a PATCH request to `/api/users/:id`.

#### Delete a user

Send a DELETE request to `/api/users/:id`. You can only delete your own account.

#### Report a user

Send a POST request to `/api/users/report`.

### Events

#### Create an event

Send a POST request to `/api/events`.

#### Get all events

Send a GET request to `/api/events`. Supports filtering via query parameters.

##### latitude, longitude, radius

Geo filter. All three are required together. Radius is in kilometers.

##### name

Case-insensitive partial match on event name.

##### description

Case-insensitive partial match on event description.

##### ownerId

Filter by a specific owner's UUID.

##### owned

Set to `true` to filter to the current user's own events.

##### attending

Set to `true` to filter to events the current user has joined.

##### startAfter, startBefore

Filter by start time range. Values must be ISO 8601 timestamps.

##### endAfter, endBefore

Filter by end time range. Values must be ISO 8601 timestamps.

##### categories

Comma-separated list of category UUIDs. Returns events matching any of the provided categories.

#### Get a specific event

Send a GET request to `/api/events/:id`. Returns the event with a participant count.

#### Replace all event fields

Send a PUT request to `/api/events/:id`. Owner only.

#### Update specific event fields

Send a PATCH request to `/api/events/:id`. Owner only.

#### Delete an event

Send a DELETE request to `/api/events/:id`. Owner only.

#### Join an event

Send a POST request to `/api/events/:id/join`.

#### Leave an event

Send a DELETE request to `/api/events/:id/join`.

### Event categories

#### Create a category

Send a POST request to `/api/event-categories`.

#### Get all categories

Send a GET request to `/api/event-categories`.

#### Get a category by id

Send a GET request to `/api/event-categories/:id`.

#### Replace a category

Send a PUT request to `/api/event-categories/:id`.

#### Update specific category fields

Send a PATCH request to `/api/event-categories/:id`.

#### Delete a category

Send a DELETE request to `/api/event-categories/:id`.

### Health check

Send a GET request to `/api/health`.

## Database schema

### users

Registered accounts with profile info and authentication credentials.

### events

Location-based events with a name, description, address, geo-coordinates, and a start and end time.

### categories

Reusable event categories with auto-generated slugs.

### event_categories

Junction table linking events to categories (many-to-many).

### user_events

Junction table tracking which users have joined which events (many-to-many).

### reports

User-submitted reports against other users.

## Development

### Lint and format

Run `pnpm run lint-format` from the root to lint and format the entire codebase using Biome.

### Database

Run `pnpm run db:push` to sync the Drizzle schema to the database, and `pnpm run db:studio` to open Drizzle Studio.

For more database management commands, see [docs/BACKEND.md](docs/BACKEND.md).

### Seeding

Predefined event categories are inserted automatically every time the server starts.

To seed the database with randomly generated users and events on startup, set `SEED_DB_ON_STARTUP=true` in `backend/.env`. Setting it to `"development"` seeds only when `NODE_ENV` is `development`. Both options also create a test user. The test user's credentials can be configured with the following env vars, or left at their defaults:

- `TESTUSER_USERNAME` (default: `testuser`)
- `TESTUSER_PASSWORD` (default: `testuser`)
- `TESTUSER_EMAIL` (default: `test@example.com`)
- `TESTUSER_DISPLAY_NAME` (default: `Bobson Dugnutt`)
- `TESTUSER_DATE_OF_BIRTH` (default: `1970-01-01`)

Credentials are printed to the console once the test user is created.

You can also trigger seeding manually in development via the API:

```sh
POST /api/development/database/seed
{ "reset": true, "testUser": true }
```

Pass `reset: true` to wipe existing data before seeding. Pass `testUser: true` to include the test user.

To fully wipe the database:

```sh
POST /api/development/database/reset
```

### Test scripts

There are scripts in `backend/scripts/` for quick and dirty testing. Run them with `node <script-name>.js` from the `backend/scripts/` folder.

- `create-user.js` - creates a user, signs in, and prints a JWT token
- `create-category.js` - creates a category
- `create-event.js` - creates an event
- `nuke-database.js` - fully wipes and rebuilds the database

## Production build

The included `Dockerfile` produces a production image:

1. Stage 1 builds the frontend with Vite.
2. Stage 2 copies the backend source and the built frontend, then runs the Express server which also serves the frontend static files.

The server listens on port 3000.

## Internal documentation

More detailed guides are available in the `docs/` folder:

- [docs/README.md](docs/README.md) - quick start and technology overview
- [docs/BACKEND.md](docs/BACKEND.md) - backend guide, API examples, naming conventions, and code style

## Elevator pitch

### Neighbro

Connect with new friends and neighbors through exciting events happening right in your backyard. Discover a hidden community all around you! Come meet your neighbors and be part of what makes your community come to life!

- Create events that bring people together
- Show up for events close to home (and close to heart)
- Shape the community you want to live in

Your neighborhood is waiting to be discovered. Are you ready to step outside?

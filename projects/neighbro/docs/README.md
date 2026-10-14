# Internal README.md

## This project uses the following

### Frontend

- Vite with React + TypeScript
- Tanstack Router
- Tanstack Query

#### Start the frontend server

Run `pnpm run dev` to start the development server.

### Backend

- Express*
- PostgreSQL
- Drizzle
- JWT
- Bcrypt
- Cors
- Env

#### Start the backend server

Run `pnpm run server` to start the development server and the Docker container at the same time.

Make sure to have OrbStack, PodMan or Docker running.

## Quick start

Run `pnpm run dev` in the root folder to start both frontend and backend at the same time.

If you do that, you must manually start the Docker container that the database lives in!

Remember to install dependencies before you go!

```sh
pnpm install
```

# Stage 1: Build frontend
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN corepack enable && pnpm install --frozen-lockfile
COPY frontend ./frontend
RUN pnpm --filter frontend build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node backend/package.json ./backend/
COPY --chown=node:node frontend/package.json ./frontend/
RUN corepack enable && pnpm install --frozen-lockfile && chown node:node /app
COPY --chown=node:node backend ./backend
COPY --chown=node:node --from=build /app/frontend/dist ./frontend/dist

USER node
EXPOSE 3000
CMD ["/app/backend/node_modules/.bin/tsx", "/app/backend/src/server.ts"]

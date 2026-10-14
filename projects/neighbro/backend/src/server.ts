import cors from "cors";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import express from "express";
import { collectDefaultMetrics, register } from "prom-client";
import { db } from "./database/index.js";
import errorMiddleware from "./middleware/error.middleware.js";
import metricsMiddleware from "./middleware/metrics.middleware.js";
import authRoutes from "./routes/auth-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import developmentRoutes from "./routes/development-routes.js";
import eventRoutes from "./routes/event-routes.js";
import meRoutes from "./routes/me-routes.js";
import userRoutes from "./routes/user-routes.js";
import { createCategories } from "./utils/categories.js";
import { checkForEnvVariable } from "./utils/check-env-variable.js";
import { seedDatabase } from "./utils/development.js";

collectDefaultMetrics();

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

const CORS_ORIGIN = checkForEnvVariable("CORS_ORIGIN");
const SERVER_PORT = checkForEnvVariable("SERVER_PORT");
const DATABASE_PORT = process.env["DATABASE_PORT"];
const SEED_DB_ON_STARTUP = process.env["SEED_DB_ON_STARTUP"];

app.use(cors({ origin: CORS_ORIGIN }));
app.use(metricsMiddleware);

app.get("/metrics", async (_request, response) => {
  response.set("Content-Type", register.contentType);
  response.end(await register.metrics());
});

app.get("/api/health", async (_request, response) => {
  try {
    const healthCheck = await db.execute(
      sql`SELECT 'Hello from Express and PostgreSQL!' AS greeting, current_database(), current_user, version()`,
    );
    response.status(200).json({ message: healthCheck.rows });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/me", meRoutes);
app.use("/api/event-categories", categoryRoutes);

// Create predefined categories for both production and development environments
createCategories();

if (process.env["NODE_ENV"] === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.use((_request, response) => {
    response.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  // Enable development routes in non-production environments
  app.use("/api/development", developmentRoutes);
}
// Seed the database if true or in development mode
if (
  SEED_DB_ON_STARTUP === "true" ||
  (SEED_DB_ON_STARTUP === "development" && process.env["NODE_ENV"] === "development")
) {
  seedDatabase(false, true);
}

app.use(errorMiddleware);

app.listen(SERVER_PORT, () => {
  console.log(
    `Express is running at port ${SERVER_PORT}. PostgreSQL is running at port ${DATABASE_PORT}. Go to http://localhost:${SERVER_PORT}/api/health for some diagnostic information!`,
  );
});

import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { checkForEnvVariable } from "./src/utils/check-env-variable.js";

export default defineConfig({
  dbCredentials: {
    url: checkForEnvVariable("DATABASE_URL"),
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/database/schema.ts",
});

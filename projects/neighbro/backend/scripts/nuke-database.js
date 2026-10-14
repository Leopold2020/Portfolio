import { execSync } from "node:child_process";

const BACKEND_DIR = new URL("..", import.meta.url).pathname;
const DOCKER_COMPOSE_PATH = new URL("../docker-compose.yaml", import.meta.url).pathname;

try {
  execSync(`docker compose -f ${DOCKER_COMPOSE_PATH} down`, { stdio: "inherit" });
  execSync("docker volume rm backend_pgdata", { stdio: "inherit" });
  execSync(`docker compose -f ${DOCKER_COMPOSE_PATH} up -d`, { stdio: "inherit" });
  execSync("sleep 6.7"); // HEHE!!
  execSync("pnpm run db:push", { cwd: BACKEND_DIR, stdio: "inherit" });

  console.log("The database has been nuked but/and is now up and running again!");
} catch (error) {
  throw new Error(`Failed to nuke the database: ${error.message}`);
}

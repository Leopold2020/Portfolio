import { Router } from "express";
import { fullResetDatabase, seedDatabase } from "../controllers/development.controllers.js";

const router = Router();

// POST /development/database/seed - Seed the database
router.post("/database/seed", seedDatabase);

// POST /development/database/reset - Reset the database
router.post("/database/reset", fullResetDatabase);

export default router;

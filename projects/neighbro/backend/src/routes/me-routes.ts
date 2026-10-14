import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// GET /me - Get current user
router.get("/", authenticate, getCurrentUser);

export default router;

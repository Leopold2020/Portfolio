import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signIn, signUp } from "../controllers/auth.controllers.js";

const router = Router();

// Rate limit: max 10 attempts per 15 minutes to slow down brute-force attacks

const limiter = rateLimit({
  limit: 10,
  message: { error: "Too many attempts, please try again later." },
  skip: () => process.env["NODE_ENV"] === "development",
  statusCode: 429,
  windowMs: 15 * 60 * 1000,
});

// POST /auth/sign-up - Create a new account

router.post("/sign-up", limiter, signUp);

// POST /auth/sign-in - Sign in to an existing account

router.post("/sign-in", limiter, signIn);

export default router;

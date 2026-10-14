import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types/auth-request.js";
import { checkForEnvVariable } from "../utils/check-env-variable.js";
import { AppError } from "./error.middleware.js";

// Check that the JWT exists
const JWT_SECRET = checkForEnvVariable("JWT_SECRET");

export function authenticate(request: AuthRequest, _response: Response, next: NextFunction): void {
  const bearerToken = request.headers.authorization;

  if (!bearerToken?.startsWith("Bearer ")) {
    next(new AppError("No token provided", 401));
    return;
  }

  const token = bearerToken.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    request.userId = (payload as { userId: string }).userId;
    next();
  } catch (error) {
    let errorMessage: string | undefined;
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    next(new AppError("Invalid or expired token", 401, errorMessage));
  }
}

export function requireSelf(request: AuthRequest, _response: Response, next: NextFunction): void {
  const userId = request.params["id"];

  if (request.userId !== userId) {
    next(new AppError("You are only allowed to modify your own account", 403));
    return;
  }

  next();
}

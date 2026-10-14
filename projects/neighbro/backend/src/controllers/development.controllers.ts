import type { NextFunction, Request, Response } from "express";
import * as devUtils from "../utils/development.js";
import { validateSeedReset, validateSeedTestUser } from "../utils/input-validation.js";

export const fullResetDatabase = async (_request: Request, response: Response, _next: NextFunction): Promise<void> => {
  await devUtils.resetDatabase();
  response.status(200).json({ message: "Database reset successfully" });
};

export const seedDatabase = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const { reset = false, testUser = false } = request.body;
    validateSeedReset(reset);
    validateSeedTestUser(testUser);

    const createdTestUser = await devUtils.seedDatabase(reset, testUser);
    response.status(201).json({ message: "Database seeded successfully", testUser: createdTestUser });
  } catch (error) {
    next(error);
  }
};

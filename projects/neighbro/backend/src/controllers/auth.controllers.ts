import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../database/index.js";
import { users } from "../database/schema.js";
import { AppError } from "../middleware/error.middleware.js";
import { checkForEnvVariable } from "../utils/check-env-variable.js";
import {
  validateAge,
  validateBirthDate,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/input-validation.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = checkForEnvVariable("JWT_SECRET");

// POST /auth/sign-up - Create a new account
export const signUp = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  let { username, email, password, displayName, dateOfBirth } = request.body;

  // Type checking
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof email !== "string" ||
    typeof displayName !== "string" ||
    typeof dateOfBirth !== "string"
  ) {
    throw new AppError("All fields must be strings", 400);
  }

  // Trim all string fields
  username = username.trim();
  email = email.trim().toLowerCase();
  displayName = displayName.trim();
  dateOfBirth = dateOfBirth.trim();

  // Check required fields
  if (!username || !password || !email || !displayName || !dateOfBirth) {
    throw new AppError("All fields are required", 400);
  }

  // Validate username
  validateUsername(username);

  // Validate email
  validateEmail(email);

  // Validate password
  validatePassword(password);

  // Validate displayName
  validateDisplayName(displayName);

  // Validate date of birth format
  const validatedDateOfBirth = validateBirthDate(dateOfBirth);

  // Validate age (must be 18 or older)
  validateAge(validatedDateOfBirth);

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({
        dateOfBirth,
        displayName,
        email,
        password: hashedPassword,
        username,
      })
      .returning({
        dateOfBirth: users.dateOfBirth,
        id: users.id,
        username: users.username,
      });

    if (!user) {
      throw new AppError("Failed to create user", 500);
    }

    response.status(201).json({ message: "User created successfully", success: true });
  } catch (error) {
    next(error);
  }
};

// currently the token is send in body. It is the subject of issue #31 to ensure tokens are managed in httpOnly cookies.

// POST /auth/sign-in - Sign in to an existing account
export const signIn = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  let { username, password } = request.body;

  // Type checking
  if (typeof username !== "string" || typeof password !== "string") {
    throw new AppError("Username and password must be strings", 400);
  }

  // Trim username
  username = username.trim();

  // Check required fields
  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }

  try {
    const [user] = await db
      .select({ id: users.id, password: users.password, username: users.username })
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError("Invalid username or password", 401);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    response.json({
      message: "User signed in successfully",
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    next(error);
  }
};

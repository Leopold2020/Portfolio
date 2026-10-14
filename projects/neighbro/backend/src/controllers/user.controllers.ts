import { eq } from "drizzle-orm";
import type { NextFunction, Response } from "express";
import { db } from "../database/index.js";
import { reports, users } from "../database/schema.js";
import { AppError } from "../middleware/error.middleware.js";
import type { AuthRequest } from "../types/auth-request.js";
import {
  validateAge,
  validateBio,
  validateBirthDate,
  validateDisplayName,
  validateEmail,
  validateEventsJoined,
  validateIsVerified,
  validateLastActiveAt,
  validateNumberOrNull,
  validateStringField,
  validateUserId,
  validateUsername,
} from "../utils/input-validation.js";

const safeUserSelect = {
  avatarId: users.avatarId,
  bio: users.bio,
  dateOfBirth: users.dateOfBirth,
  displayName: users.displayName,
  email: users.email,
  eventsJoined: users.eventsJoined,
  id: users.id,
  joinedAt: users.joinedAt,
  lastActiveAt: users.lastActiveAt,
  username: users.username,
  verifiedAt: users.verifiedAt,
};

// GET /users - Get all users
export const getAllUsers = async (_request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await db.select(safeUserSelect).from(users);
    response.status(200).json({ message: "Users fetched successfully", result, success: true });
  } catch (error) {
    next(error);
  }
};

// GET /users/:id - Get a specific user by id
export const getUserById = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const id = validateUserId(request.params["id"]);

    const result = await db.select(safeUserSelect).from(users).where(eq(users.id, id));

    if (result.length === 0) {
      throw new AppError("No user with that id could be found", 404);
    }

    response.json({ message: "User fetched successfully", success: true, user: result[0] });
  } catch (error) {
    next(error);
  }
};

// GET /users/me - Get a current user

export const getCurrentUser = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const id = request.userId;

    if (!id) {
      throw new AppError("You are not logged in", 401);
    }

    const result = await db.select(safeUserSelect).from(users).where(eq(users.id, id));

    if (result.length === 0) {
      throw new AppError("No user with that id could be found", 404);
    }

    response.json({ message: "User fetched successfully", success: true, user: result[0] });
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id - Replace all fields on a user (full update)
export const updateUserFull = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = validateUserId(request.params["id"]);

    let { username, displayName, dateOfBirth, avatarId, eventsJoined, email, lastActiveAt, isVerified, bio } =
      request.body;

    // Validate all required fields are present
    if (
      username === undefined ||
      displayName === undefined ||
      dateOfBirth === undefined ||
      avatarId === undefined ||
      eventsJoined === undefined ||
      email === undefined ||
      lastActiveAt === undefined ||
      isVerified === undefined ||
      bio === undefined
    ) {
      throw new AppError(
        "username, displayName, dateOfBirth, avatarId, eventsJoined, email, lastActiveAt, isVerified are required",
        400,
      );
    }

    // Validate and trim username
    username = validateStringField(username, "Username");
    validateUsername(username);

    // Validate displayName
    validateDisplayName(displayName);

    // Validate email
    validateEmail(email);

    // Validate date of birth
    const validatedDateOfBirth = validateBirthDate(dateOfBirth);
    validateAge(validatedDateOfBirth);

    // Handle avatarId (can be null or number)
    validateNumberOrNull(avatarId, "Avatar id");

    validateEventsJoined(eventsJoined);

    const parsedLastActiveAt = validateLastActiveAt(lastActiveAt);

    // Validate isVerified
    validateIsVerified(isVerified);

    validateBio(bio);

    let verifiedAt: Date | null;
    if (isVerified) {
      verifiedAt = new Date();
    } else {
      verifiedAt = null;
    }

    const result = await db
      .update(users)
      .set({
        avatarId,
        bio,
        dateOfBirth,
        displayName,
        email,
        eventsJoined,
        lastActiveAt: parsedLastActiveAt,
        username,
        verifiedAt,
      })
      .where(eq(users.id, userId))
      .returning(safeUserSelect);

    if (result.length === 0) {
      throw new AppError("No user could be found", 404);
    }

    response.json({ user: result[0] });
  } catch (error) {
    next(error);
  }
};

interface UserFieldsToUpdate {
  username?: string;
  displayName?: string;
  dateOfBirth?: string;
  avatarId?: number | null;
  eventsJoined?: number;
  email?: string;
  lastActiveAt?: Date;
  verifiedAt?: Date | null;
}

// PATCH /users/:id - Update some fields on a user (partial update)
export const updateUserPartial = async (
  request: AuthRequest,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = validateUserId(request.params["id"]);
    const { username, displayName, dateOfBirth, avatarId, eventsJoined, email, lastActiveAt, isVerified, bio } =
      request.body;

    // Validate all required fields are present
    if (
      username === undefined &&
      displayName === undefined &&
      dateOfBirth === undefined &&
      avatarId === undefined &&
      eventsJoined === undefined &&
      email === undefined &&
      lastActiveAt === undefined &&
      bio === undefined
    ) {
      throw new AppError(
        "At least one of username, displayName, dateOfBirth, avatarId, eventsJoined, email, lastActiveAt are required",
        400,
      );
    }

    const fieldsToUpdate: UserFieldsToUpdate = {};

    // Validate and trim username
    if (username !== undefined) {
      const trimmedUsername = validateStringField(username, "Username");
      validateUsername(trimmedUsername);
      fieldsToUpdate.username = trimmedUsername;
    }

    // Validate and add email if provided
    if (email !== undefined) {
      validateEmail(email);
      fieldsToUpdate.email = email.trim().toLowerCase();
    }

    // Validate displayName
    if (displayName !== undefined) {
      validateDisplayName(displayName);
      fieldsToUpdate.displayName = displayName;
    }

    // Validate birth date
    if (dateOfBirth !== undefined) {
      const validatedDateOfBirth = validateBirthDate(dateOfBirth);
      validateAge(validatedDateOfBirth);
      fieldsToUpdate.dateOfBirth = dateOfBirth;
    }

    // Handle avatarId (can be null or number)
    if (avatarId !== undefined) {
      validateNumberOrNull(avatarId, "Avatar id");
      fieldsToUpdate.avatarId = avatarId;
    }

    if (eventsJoined !== undefined) {
      validateEventsJoined(eventsJoined);
      fieldsToUpdate.eventsJoined = eventsJoined;
    }

    if (bio !== undefined) {
      validateBio(bio);
      fieldsToUpdate.bio = bio;
    }

    // Validate and add lastActiveAt if provided
    if (lastActiveAt !== undefined) {
      fieldsToUpdate.lastActiveAt = validateLastActiveAt(lastActiveAt);
    }

    // Validate and add isVerified if provided (boolean only)
    if (isVerified !== undefined) {
      validateIsVerified(isVerified);
      if (isVerified) {
        fieldsToUpdate.verifiedAt = new Date();
      } else {
        fieldsToUpdate.verifiedAt = null;
      }
    }

    const result = await db.update(users).set(fieldsToUpdate).where(eq(users.id, userId)).returning(safeUserSelect);

    if (result.length === 0) {
      throw new AppError("No user could be found", 404);
    }

    response.json({ message: "User partially updated successfully!", success: true, user: result[0] });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id - Delete a specific user
export const deleteUser = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = validateUserId(request.params["id"]);

    const result = await db.delete(users).where(eq(users.id, userId)).returning({
      email: users.email,
      id: users.id,
      username: users.username,
    });

    if (result.length === 0) {
      throw new AppError("No user with that id could be found", 404);
    }

    response.status(200).json({
      message: "User deleted successfully",
      success: true,
      user: result[0],
    });
  } catch (error) {
    next(error);
  }
};

// POST /report - Report a specific user
export const reportUser = async (request: AuthRequest, response: Response, next: NextFunction): Promise<void> => {
  try {
    const reporterId = validateUserId(request.userId);
    const { reportedUserId, reason } = request.body;
    const validatedReportedUserId = validateUserId(reportedUserId);

    if (typeof reason !== "string" || reason.trim() === "") {
      throw new AppError("Reason for reporting must be a non-empty string", 400);
    }

    const result = await db
      .insert(reports)
      .values({
        reason: reason.trim(),
        reportedUserId: validatedReportedUserId,
        reporterUserId: reporterId,
      })
      .returning({ id: reports.reporterUserId });

    if (result.length === 0) {
      throw new AppError("Failed to report user", 500);
    }

    response.status(201).json({ message: "User reported successfully", success: true });
  } catch (error) {
    next(error);
  }
};

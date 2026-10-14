// Allow unicode letter with whitespace, hyphens and apostrophes
// Blocks numbers, symbols and control characters

import { validate as validateUUID } from "uuid";
import { AppError } from "../middleware/error.middleware.js";

const checkNameFormat = /[^\p{L}\p{M}\s'-]/u;

// Validate email (RFC 5322)

export const checkEmailFormat = new RegExp(
  "^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*" +
    '|"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")' +
    "@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?" +
    "|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}" +
    "(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:" +
    "(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$",
);

export const validateUsername = (username: string): void => {
  validateStringField(username, "Username");
  const trimmed = username.trim();
  if (trimmed.length < 2) {
    throw new AppError("Username must be at least 2 characters", 400);
  }
  if (trimmed.length > 30) {
    throw new AppError("Username must be no longer than 30 characters", 400);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new AppError("Username can only contain letters, numbers, underscores, and hyphens", 400);
  }
};

export const validateDisplayName = (name: string | null): void => {
  if (name === null) return;
  validateStringField(name, "Display name");
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new AppError("Display name must be at least 2 characters", 400);
  }
  if (trimmed.length > 255) {
    throw new AppError("Display name must be no longer than 255 characters", 400);
  }
  if (checkNameFormat.test(trimmed)) {
    throw new AppError("Display name can only contain letters, spaces, hyphens, and apostrophes", 400);
  }
};

export const validateNumberOrNull = (value: string | null, fieldName: string): void => {
  if (value === null) return;
  if (typeof value !== "number") {
    throw new AppError(`${fieldName} must be a number or null`, 400);
  }
};

export const validateEventsJoined = (eventsJoined: number): void => {
  if (eventsJoined < 0) {
    throw new AppError("Number of joined events cannot be less than 0", 400);
  }
};

export const validateEmail = (email: string): void => {
  validateStringField(email, "email");
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new AppError("Invalid email address", 400);
  }
  if (trimmed.length > 255) {
    throw new AppError("Email must be no longer than 255 characters", 400);
  }
};

export const validatePassword = (password: string): void => {
  validateStringField(password, "Password");
  if (password.length < 12) {
    throw new AppError("Password must be at least 12 characters", 400);
  }
  if (password.length > 72) {
    throw new AppError("Password must be no longer than 72 characters", 400);
  }
};

const validateDateString = (value: unknown, fieldName: string): Date => {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, 400);
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    throw new AppError(`Invalid ${fieldName} format. Please use YYYY-MM-DD`, 400);
  }

  const dateComponents = value.split("-");
  const year = Number(dateComponents[0]);
  const month = Number(dateComponents[1]);
  const day = Number(dateComponents[2]);

  if (month < 1 || month > 12) {
    throw new AppError(`Invalid ${fieldName}: month must be between 01 and 12`, 400);
  }

  if (day < 1 || day > 31) {
    throw new AppError(`Invalid ${fieldName}: day must be between 01 and 31`, 400);
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new AppError(`Invalid ${fieldName}: please enter a valid date`, 400);
  }

  return date;
};

export const validateBirthDate = (birthDate: unknown): Date => {
  const date = validateDateString(birthDate, "Birth date");

  const currentYear = new Date().getFullYear();
  if (date.getFullYear() < 1900 || date.getFullYear() > currentYear) {
    throw new AppError(`Year must be between 1900 and ${currentYear}`, 400);
  }

  if (date > new Date()) {
    throw new AppError("Birth date cannot be in the future", 400);
  }

  return date;
};

export const validateAge = (birthDate: Date): void => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    throw new AppError("You must be at least 18 years old to register", 400);
  }
};

const validateUuidFormat = (id: unknown, entityName: string): string => {
  if (typeof id !== "string") {
    throw new AppError(`${entityName} ID must be a string`, 400);
  }

  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new AppError(`${entityName} ID cannot be empty`, 400);
  }

  if (!validateUUID(trimmedId)) {
    throw new AppError(`Invalid ${entityName} ID format. Must be a valid UUID`, 400);
  }

  return trimmedId;
};

export const validateUserId = (id: unknown): string => {
  return validateUuidFormat(id, "User");
};

export const validateEventId = (id: unknown): string => {
  return validateUuidFormat(id, "Event");
};

export const validateCategoryId = (id: unknown): string => {
  return validateUuidFormat(id, "Category");
};

export const validateCategoryIdList = (ids: unknown[]): string[] => {
  if (!ids || ids.length === 0) {
    throw new AppError("Category IDs list cannot be empty", 400);
  }

  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length !== ids.length) {
    throw new AppError("Category IDs list contains duplicates", 400);
  }

  return uniqueIds.map((id) => validateUuidFormat(id, "Category"));
};

export const validateCategoryParameter = (categories: unknown): string[] => {
  if (typeof categories !== "string") {
    throw new AppError("Categories must be a single UUID or a comma-separated list of UUIDs", 400);
  }
  return validateCategoryIdList(categories.split(","));
};

export const validateStringField = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, 400);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError(`${fieldName} cannot be empty`, 400);
  }
  return trimmed;
};

export const validateTimestamp = (value: unknown, fieldName: string): Date => {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, 400);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Invalid ${fieldName}. Please use ISO 8601 format (e.g. 2026-12-20T18:00:00.000Z)`, 400);
  }

  return date;
};

export const validateLastActiveAt = (lastActiveAt: unknown): Date => {
  return validateTimestamp(lastActiveAt, "lastActiveAt");
};

export const validateIsVerified = (isVerified: unknown): void => {
  if (typeof isVerified !== "boolean") {
    throw new AppError("isVerified must be a boolean", 400);
  }
};

export const validateCoordinate = (value: unknown, fieldName: string, minimum: number, maximum: number): number => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new AppError(`${fieldName} must be a number`, 400);
  }

  if (parsedValue < minimum || parsedValue > maximum) {
    throw new AppError(`${fieldName} must be between ${minimum} and ${maximum}`, 400);
  }

  return parsedValue;
};

export const validateLatitude = (value: unknown): number => {
  return validateCoordinate(value, "Latitude", -90, 90);
};

export const validateLongitude = (value: unknown): number => {
  return validateCoordinate(value, "Longitude", -180, 180);
};

export const validateRadius = (value: unknown): number => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new AppError("Radius must be a number", 400);
  }

  if (parsedValue <= 0) {
    throw new AppError("Radius must be a positive number", 400);
  }

  return parsedValue;
};

export const validateEventName = (name: unknown): string => {
  const trimmedName = validateStringField(name, "name");

  if (trimmedName.length > 255) {
    throw new AppError("Name must be no longer than 255 characters", 400);
  }

  return trimmedName;
};

export const validateOptionalAddress = (address: unknown): string | null => {
  if (address === undefined || address === null) {
    return null;
  }

  if (typeof address !== "string") {
    throw new AppError("The address must be a string", 400);
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress === "") {
    return null;
  }

  if (trimmedAddress.length > 500) {
    throw new AppError("Address must be no longer than 500 characters", 400);
  }

  return trimmedAddress;
};

export const validateCategoryName = (name: unknown): string => {
  const trimmedName = validateStringField(name, "name");

  if (trimmedName.length > 100) {
    throw new AppError("Category name must be no longer than 100 characters", 400);
  }

  return trimmedName;
};

export const validateOptionalDescription = (description: unknown): string | null => {
  if (description === undefined || description === null) {
    return null;
  }

  if (typeof description !== "string") {
    throw new AppError("The description must be a string", 400);
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription === "") {
    return null;
  }

  return trimmedDescription;
};

export const validateSeedReset = (reset: unknown): void => {
  if (typeof reset !== "boolean") {
    throw new AppError("reset must be a boolean", 400);
  }
};

export const validateSeedTestUser = (createTestUser: unknown): void => {
  if (typeof createTestUser !== "boolean") {
    throw new AppError("testUser must be a boolean", 400);
  }
};

export const validateBio = (bio: unknown): string | null => {
  if (bio === undefined || bio === null) {
    return null;
  }

  if (typeof bio !== "string") {
    throw new AppError("The description must be a string", 400);
  }

  const trimmedBio = bio.trim();

  if (trimmedBio === "") {
    return null;
  }

  if (trimmedBio.length > 510) {
    throw new AppError("Bio must be no longer than 510 characters", 400);
  }

  return trimmedBio;
};

import type { NextFunction, Request, Response } from "express";
import { checkForEnvVariable } from "../utils/check-env-variable.js";

const NODE_ENV = checkForEnvVariable("NODE_ENV");

interface NormalizedError {
  code: number;
  internalMessage: string;
  externalMessage: string;
}

export class AppError extends Error {
  public code: number;
  public internalMessage: string;
  public externalMessage: string;

  constructor(externalMessage: string, code = 500, internalMessage?: string) {
    super();
    this.code = code;
    this.externalMessage = externalMessage;

    if (internalMessage !== undefined) {
      this.internalMessage = internalMessage;
    } else {
      this.internalMessage = "";
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface PostgresError {
  code?: string;
  detail?: string;
  column?: string;
  message?: string;
}

function handlePostgresError(code: string, errorDetail: PostgresError): NormalizedError | null {
  switch (code) {
    case "23505": {
      // unique_violation
      let detail = "Unique constraint violation";
      if (errorDetail.detail !== undefined) {
        detail = errorDetail.detail;
      }
      const internalMessage = detail;

      if (detail.includes("email")) {
        return {
          code: 409,
          externalMessage: "An account with this email already exists.",
          internalMessage,
        };
      }

      if (detail.includes("username")) {
        return {
          code: 409,
          externalMessage: "The username has already been taken.",
          internalMessage,
        };
      }

      return {
        code: 409,
        externalMessage: "The resource already exists.",
        internalMessage,
      };
    }

    case "23503": {
      // foreign_key_violation
      let foreignKeyInternalMessage = "Foreign key violation";
      if (errorDetail !== null && errorDetail.detail !== undefined) {
        foreignKeyInternalMessage = errorDetail.detail;
      }

      return {
        code: 400,
        externalMessage: "Invalid reference to related resource.",
        internalMessage: foreignKeyInternalMessage,
      };
    }

    case "23502": {
      // not_null_violation
      let columnName = "unknown";
      if (errorDetail !== null && errorDetail.column !== undefined) {
        columnName = errorDetail.column;
      }

      return {
        code: 400,
        externalMessage: "Missing required information.",
        internalMessage: `Missing required field: ${columnName}`,
      };
    }

    case "22P02": {
      // invalid_text_representation
      let invalidMessage = "Invalid input format";
      if (errorDetail !== null && errorDetail.message !== undefined) {
        invalidMessage = errorDetail.message;
      }

      return {
        code: 400,
        externalMessage: "Invalid input format.",
        internalMessage: invalidMessage,
      };
    }

    case "22008": {
      // datetime_field_overflow
      let datetimeMessage = "Datetime field overflow";
      if (errorDetail !== null && errorDetail.message !== undefined) {
        datetimeMessage = errorDetail.message;
      }

      return {
        code: 400,
        externalMessage: "One or more date/time values are out of range.",
        internalMessage: datetimeMessage,
      };
    }

    case "22001": {
      // value too long for column
      let tooLongMessage = "Value too long for column";
      if (errorDetail !== null && errorDetail.message !== undefined) {
        tooLongMessage = errorDetail.message;
      }

      return {
        code: 400,
        externalMessage: "One or more values exceed the maximum allowed length.",
        internalMessage: tooLongMessage,
      };
    }

    case "42P01": {
      // undefined_table
      let undefinedTableMessage = "Relation does not exist";
      if (errorDetail !== null && errorDetail.message !== undefined) {
        undefinedTableMessage = errorDetail.message;
      }

      return {
        code: 500,
        externalMessage: "A database schema error has occurred. Do a migration, run db:push or nuke the database :).",
        internalMessage: undefinedTableMessage,
      };
    }

    default:
      return null;
  }
}

function normalizeError(error: unknown): NormalizedError & { isAppError: boolean } {
  // Custom AppError (developer-intentional)
  if (error instanceof AppError) {
    let internalMessage = error.internalMessage;

    if (internalMessage === "") {
      internalMessage = error.externalMessage;
    }

    return {
      code: error.code,
      externalMessage: error.externalMessage,
      internalMessage,
      isAppError: true,
    };
  }

  // Native Error (unexpected)
  let internalMessage = "Server Error";
  const externalMessage =
    "An unexpected error has occurred. If this feels unexpected, you should perhaps practice to expect the unexpected.";

  if (error instanceof Error) {
    let postgresErrorCode: string | undefined;
    let postgresErrorDetail: PostgresError = error as PostgresError;

    if ("code" in error && typeof error.code === "string") {
      postgresErrorCode = error.code;
    } else if (
      error.cause &&
      typeof error.cause === "object" &&
      error.cause !== null &&
      "code" in error.cause &&
      typeof (error.cause as Record<string, unknown>)["code"] === "string"
    ) {
      postgresErrorCode = (error.cause as Record<string, unknown>)["code"] as string;
      postgresErrorDetail = error.cause as PostgresError;
    }

    if (error.cause instanceof Error) {
      internalMessage = error.cause.message;
    } else {
      internalMessage = error.message;
    }

    if (internalMessage === undefined || internalMessage === null) {
      internalMessage = "Server Error";
    }

    // PostgreSQL handling
    if (postgresErrorCode) {
      const postgresResult = handlePostgresError(postgresErrorCode, postgresErrorDetail);

      if (postgresResult !== null) {
        return {
          ...postgresResult,
          isAppError: true,
        };
      }
    }

    // Fallback detection for duplicate key
    let causeMessage = "";
    if (error.cause instanceof Error) {
      causeMessage = error.cause.message;
    }

    const hasDuplicateKey =
      causeMessage.includes("duplicate key") ||
      causeMessage.includes("23505") ||
      error.message.includes("duplicate key") ||
      error.message.includes("23505");

    if (hasDuplicateKey) {
      return {
        code: 409,
        externalMessage: "This resource already exists.",
        internalMessage,
        isAppError: true,
      };
    }
  }

  return {
    code: 500,
    externalMessage,
    internalMessage,
    isAppError: false,
  };
}

const errorMiddleware = (error: AppError, _request: Request, response: Response, _next: NextFunction): void => {
  const { code, internalMessage, externalMessage, isAppError } = normalizeError(error);

  // Client gets different message based on environment
  const responseBody: {
    message: string;
    success: boolean;
    stack?: string;
    internalMessage?: string;
  } = {
    message: externalMessage,
    success: false,
  };

  // Development-only extras
  if (NODE_ENV === "development") {
    if (!isAppError) {
      if (error instanceof Error) {
        if (error.stack !== undefined) {
          responseBody.stack = error.stack;
        }
      }
      responseBody.internalMessage = internalMessage;
    }
  }

  response.status(code).json(responseBody);
};

export default errorMiddleware;

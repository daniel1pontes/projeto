export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const createError = (message: string, statusCode: number): AppError => {
  return new AppError(message, statusCode);
};

export const errorHandler = (
  err: Error | AppError,
  req: any,
  res: any,
  next: any
) => {
  let error = err as AppError;

  if (!error.statusCode) {
    error = createError(err.message || "Server Error", 500);
  }

  // Log error
  if (typeof console !== "undefined") {
    console.error(err);
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const message = "Database operation failed";
    error = createError(message, 400);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const message = "Validation failed";
    error = createError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { AppError } from "../Errors/appErrors";
import { StatusCodes } from "http-status-codes";
import { handleMongooseDuplicateError } from "../ErrorHelpers/duplicateError";
import { handleValidationError } from "../ErrorHelpers/validationError";
import { zodError } from "../ErrorHelpers/zodError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = "something went wrong";
  let statusCode = 500;
  let errorSources: any = [];

  if (err instanceof Error) {
    message = err.message;
    statusCode = 500;
  }
  if (err instanceof AppError) {
    message = err.message;
    statusCode = err.statusCode;
  }

  if (err.code === 11000) {
    // ✅ Mongoose duplicate error handle
    const simplifiedError = handleMongooseDuplicateError(err);
    statusCode = 400;
    message = `${simplifiedError.message} already exists!!`;
  }

  // ✅ Mongoose validationError handle
  if (err.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources;
    message = simplifiedError.message;
  }

  if (err.name === "ZodError") {
    const simplifiedError = zodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  if (err.name === "TokenExpiredError") {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "token expired, please again login ";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: process.env.NODE_ENV === "development" ? err : null,
    // stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};

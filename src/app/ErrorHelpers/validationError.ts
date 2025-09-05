/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IErrorResponse, IErrorSources } from "../types/ErrorTypes";

export const handleValidationError = (
  err: mongoose.Error.ValidationError
): IErrorResponse => {
  const errorSources: IErrorSources[] = [];
  const errors = Object.values(err.errors);
  errors.forEach((errorObject: any) =>
    errorSources.push({
      path: errorObject.path,
      message: errorObject.message,
    })
  );

  return {
    statusCode: 400,
    errorSources,
    message: "Validation error",
    success: false,
  };
};

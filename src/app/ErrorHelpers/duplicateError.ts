import { IErrorResponse } from "../types/ErrorTypes";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleMongooseDuplicateError = (err: any): IErrorResponse => {
  const duplicateMatch = err.message.match(/"([^"]*)"/);
  const duplicate = duplicateMatch ? duplicateMatch[1] : "Field";

  return {
    success: false,
    statusCode: 400,
    message: duplicate,
  };
};

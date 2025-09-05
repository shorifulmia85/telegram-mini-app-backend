import { StatusCodes } from "http-status-codes";
import { IErrorResponse, IErrorSources } from "../types/ErrorTypes";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const zodError = (err: any): IErrorResponse => {
  const errorSources: IErrorSources[] = [];
  err?.issues?.forEach((issue: any) => {
    errorSources.push({
      path: issue?.path,
      message: issue?.message,
    });
  });

  return {
    success: false,
    statusCode: StatusCodes.BAD_REQUEST,
    message: "Zod error",
    errorSources,
  };
};

import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest = (zodSchema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = zodSchema.parse(req.body);

      req.body = data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

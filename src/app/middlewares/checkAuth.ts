/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import { AppError } from "../Errors/appErrors";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../ulits/verifyToken";
import { envVars } from "../config";
import { JwtPayload } from "jsonwebtoken";
import { checkUserIsValid } from "../ulits/IsUserExits";

export const checkAuth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies.accessToken || req.headers.authorization;
      if (!accessToken) {
        throw new AppError(StatusCodes.FORBIDDEN, "No accessToken provide");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.jWT_SECRET
      ) as JwtPayload;

      await checkUserIsValid("tgId", verifiedToken?.tgId);

      if (!roles.includes(verifiedToken.role)) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "unauthorized");
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

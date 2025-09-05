import { StatusCodes } from "http-status-codes";
import { AppError } from "../Errors/appErrors";
import { User } from "../modules/TelegramAuth/telegramAuth.model";
import { IAuthStatus } from "../modules/TelegramAuth/telegramAuth.interface";

export const checkUserIsValid = async (CField: string, value: string) => {
  const payload = {
    [CField]: value,
  };

  let user;
  if (CField === "_id") {
    user = await User.findById(payload);
  }
  user = await User.findOne(payload);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user && user.status === IAuthStatus.BLOCKED) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Your account is blocked");
  }
  if (user && user.status === IAuthStatus.INACTIVE) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Your account paused...because you're long inactive"
    );
  }
  if (user && user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Your account is deleted");
  }

  return user;
};

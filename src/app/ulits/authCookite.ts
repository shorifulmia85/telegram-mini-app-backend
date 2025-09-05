import { Response } from "express";

interface authToken {
  accessToken: string;
  refreshToken: string;
}
export const authCookie = (res: Response, token: authToken) => {
  if (token.accessToken) {
    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }
  if (token.refreshToken) {
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }
};
export const clearCookie = async (res: Response, tokenName: string) => {
  res.clearCookie(tokenName, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
};

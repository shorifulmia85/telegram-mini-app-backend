import { Response } from "express";

interface IMeta {
  total: number;
}

interface IResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  meta?: IMeta;
}

export const sendResponse = <T>(res: Response, data: IResponse<T>) => {
  res.status(data?.statusCode).json({
    success: data?.success,
    message: data?.message,
    data: data?.data,
    meta: data?.meta,
  });
};

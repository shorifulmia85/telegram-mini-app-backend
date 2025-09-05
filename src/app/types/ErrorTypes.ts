export interface IErrorSources {
  path: string;
  message: string;
}

export interface IErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errorSources?: IErrorSources[];
}

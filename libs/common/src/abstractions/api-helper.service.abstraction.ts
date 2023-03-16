import { ErrorResponse } from "../models/response/error.response";

export abstract class ApiHelperService {
  //#region Http Request Creation Methods

  buildRequestUrl: (path: string, apiUrl?: string) => string;

  // Note: createRequest && send here do not deal with auth .
  // For authed requests, the auth bearer token is attached in the api service.
  createRequest: (
    method: "GET" | "POST" | "PUT" | "DELETE",
    requestUrl: string,
    body: any,
    hasResponse: boolean,
    alterHeaders?: (headers: Headers) => Promise<void> | void
  ) => Promise<Request>;

  send: (
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body: any,
    hasResponse: boolean,
    apiUrl?: string,
    alterHeaders?: (headers: Headers) => void
  ) => Promise<Response>;

  fetch: (request: Request) => Promise<Response>;
  nativeFetch: (request: Request) => Promise<Response>;

  handleUnauthedError: (
    response: Response,
    tokenError: boolean,
    responseBodyJson?: any
  ) => Promise<ErrorResponse | null>;

  getErrorResponseJson: (errorResponse: Response) => Promise<any>;

  buildErrorResponse: (
    errorResponseJson: any,
    responseStatus: number,
    tokenError: boolean
  ) => ErrorResponse;

  //#endregion Http Request Creation Methods

  //#region Utility Methods
  qsStringify: (params: any) => string;
  isJsonResponse: (response: Response) => boolean;
  //#endregion Utility methods
}

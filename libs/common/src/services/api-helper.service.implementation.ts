import { ApiHelperService as ApiHelperService } from "../abstractions/api-helper.service.abstraction";
import { EnvironmentService } from "../abstractions/environment.service";
import { PlatformUtilsService } from "../abstractions/platformUtils.service";
import { DeviceType } from "../enums/deviceType";
import { Utils } from "../misc/utils";
import { ErrorResponse } from "../models/response/error.response";

//TODO add this to js lib module
// TODO: consider creating folder in services called api-communication?

/**
 * API Helper Service which provides common functionality for API services
 * like http request creation and error handling
 */
export class ApiHelperServiceImplementation implements ApiHelperService {
  private device: DeviceType;
  private deviceType: string;
  private isWebClient = false;

  // TODO: update constructor and jslib
  constructor(
    private platformUtilsService: PlatformUtilsService,
    private environmentService: EnvironmentService,
    private customUserAgent: string
  ) {
    this.device = platformUtilsService.getDevice();
    this.deviceType = this.device.toString();
    this.isWebClient =
      this.device === DeviceType.IEBrowser ||
      this.device === DeviceType.ChromeBrowser ||
      this.device === DeviceType.EdgeBrowser ||
      this.device === DeviceType.FirefoxBrowser ||
      this.device === DeviceType.OperaBrowser ||
      this.device === DeviceType.SafariBrowser ||
      this.device === DeviceType.UnknownBrowser ||
      this.device === DeviceType.VivaldiBrowser;
  }

  //#region Http Request Creation

  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      request.headers.set("Cache-Control", "no-store");
      request.headers.set("Pragma", "no-cache");
    }
    request.headers.set("Bitwarden-Client-Name", this.platformUtilsService.getClientType());
    request.headers.set(
      "Bitwarden-Client-Version",
      await this.platformUtilsService.getApplicationVersionNumber()
    );
    return this.nativeFetch(request);
  }

  nativeFetch(request: Request): Promise<Response> {
    return fetch(request);
  }

  /**
   * Creates a bitwarden request object with appropriate headers based on method inputs.
   *
   * Useful in cases where API services cannot use `send(...)` because they require custom response handling
   * @param method - GET, POST, PUT, DELETE
   * @param requestUrl - url to send request to
   * @param body - body of request
   * @param hasResponse - whether or not to expect a response
   * @param alterHeaders - function to alter headers before sending request
   * @returns Request object
   */
  async createRequest(
    method: "GET" | "POST" | "PUT" | "DELETE",
    requestUrl: string,
    body: any,
    hasResponse: boolean,
    alterHeaders?: (headers: Headers) => Promise<void> | void
  ): Promise<Request> {
    const headers = new Headers({
      "Device-Type": this.deviceType,
    });
    if (this.customUserAgent != null) {
      headers.set("User-Agent", this.customUserAgent);
    }

    const requestInit: RequestInit = {
      cache: "no-store",
      credentials: this.getCredentials(),
      method: method,
    };

    if (body != null) {
      if (typeof body === "string") {
        requestInit.body = body;
        headers.set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
      } else if (typeof body === "object") {
        if (body instanceof FormData) {
          requestInit.body = body;
        } else {
          headers.set("Content-Type", "application/json; charset=utf-8");
          requestInit.body = JSON.stringify(body);
        }
      }
    }
    if (hasResponse) {
      headers.set("Accept", "application/json");
    }
    if (alterHeaders != null) {
      await alterHeaders(headers);
    }

    requestInit.headers = headers;

    return new Request(requestUrl, requestInit);
  }

  // Two different problems:
  // sending unauthenticated requests vs sending authenticated requests

  buildRequestUrl(path: string, apiUrl?: string): string {
    apiUrl = Utils.isNullOrWhitespace(apiUrl || "") ? this.environmentService.getApiUrl() : apiUrl;

    // Prevent directory traversal from malicious paths
    const pathParts = path.split("?");
    const requestUrl =
      apiUrl + Utils.normalizePath(pathParts[0]) + (pathParts.length > 1 ? `?${pathParts[1]}` : "");

    return requestUrl;
  }

  async send(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body: any,
    hasResponse: boolean,
    apiUrl?: string,
    alterHeaders?: (headers: Headers) => void
  ): Promise<Response> {
    const requestUrl = this.buildRequestUrl(path, apiUrl);
    const request = await this.createRequest(method, requestUrl, body, hasResponse, alterHeaders);
    const response = await this.fetch(request);

    return response;

    // const responseType = response.headers.get("content-type");
    // const responseIsJson = responseType != null && responseType.indexOf("application/json") !== -1;
    // if (hasResponse && response.status === 200 && responseIsJson) {
    //   const responseJson = await response.json(); // warning: you probably can only do this once
    //   return responseJson;
    // } else if (response.status !== 200) {
    //   const error = await this.handleError(response, false, authed);
    //   return Promise.reject(error);
    // }
  }

  // Return response object up to api service to handle

  // async send(
  //   method: "GET" | "POST" | "PUT" | "DELETE",
  //   path: string,
  //   body: any,
  //   hasResponse: boolean,
  //   apiUrl?: string,
  //   alterHeaders?: (headers: Headers) => void
  // ): Promise<any> {

  //   const requestUrl = this.buildRequestUrl(path, apiUrl);
  //   const request = await this.createRequest(method, requestUrl, body, hasResponse, alterHeaders);
  //   const response = await this.fetch(request);

  //   const responseType = response.headers.get("content-type");
  //   const responseIsJson = responseType != null && responseType.indexOf("application/json") !== -1;
  //   if (hasResponse && response.status === 200 && responseIsJson) {
  //     const responseJson = await response.json(); // warning: you probably can only do this once
  //     return responseJson;
  //   } else if (response.status !== 200) {
  //     const error = await this.handleError(response, false, authed);
  //     return Promise.reject(error);
  //   }
  // }

  async getErrorResponseJson(errorResponse: Response): Promise<any> {
    if (this.isJsonResponse(errorResponse)) {
      return await errorResponse.json();
    } else if (this.isTextResponse(errorResponse)) {
      return { Message: await errorResponse.text() };
    }
  }

  buildErrorResponse(
    errorResponseJson: any,
    responseStatus: number,
    tokenError: boolean
  ): ErrorResponse {
    return new ErrorResponse(errorResponseJson, responseStatus, tokenError);
  }

  async handleUnauthedError(
    errorResponse: Response,
    tokenError: boolean
  ): Promise<ErrorResponse | null> {
    const errorResponseJson = await this.getErrorResponseJson(errorResponse);
    return this.buildErrorResponse(errorResponseJson, errorResponse.status, tokenError);
  }

  //#endregion Http Request Creation

  //#region Utility methods
  qsStringify(params: any): string {
    return Object.keys(params)
      .map((key) => {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      })
      .join("&");
  }

  private getCredentials(): RequestCredentials | undefined {
    if (!this.isWebClient || this.environmentService.hasBaseUrl()) {
      return "include";
    }
    return undefined;
  }

  isJsonResponse(response: Response): boolean {
    const typeHeader = response.headers.get("content-type");
    return typeHeader != null && typeHeader.indexOf("application/json") > -1;
  }

  private isTextResponse(response: Response): boolean {
    const typeHeader = response.headers.get("content-type");
    return typeHeader != null && typeHeader.indexOf("text") > -1;
  }

  //#endregion Utility methods
}

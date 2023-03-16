import { ApiHelperService } from "../../abstractions/api-helper.service.abstraction";
import { AppIdService } from "../../abstractions/appId.service";
import { EnvironmentService } from "../../abstractions/environment.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
// import { DeviceType } from "../../enums/deviceType";
import { Utils } from "../../misc/utils";
import { ErrorResponse } from "../../models/response/error.response";
import { TokenApiService as TokenApiServiceAbstraction } from "../abstractions/token-api.service.abstraction";
import { DeviceRequest } from "../models/request/identity-token/device.request";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";

import { TokenService } from "./token.service";

/**
 *
 */
export class TokenApiServiceImplementation implements TokenApiServiceAbstraction {
  private identityBaseUrl: string = this.environmentService.getIdentityUrl();

  // private device: DeviceType;
  // private deviceType: string;
  // private isWebClient = false;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private environmentService: EnvironmentService,
    private tokenService: TokenService,
    private appIdService: AppIdService,
    // I'm not sure if this is right.  Idk if this should use api service or not.
    private apiHelperService: ApiHelperService
  ) {
    // this.device = platformUtilsService.getDevice();
    // this.deviceType = this.device.toString();
    // this.isWebClient =
    //   this.device === DeviceType.IEBrowser ||
    //   this.device === DeviceType.ChromeBrowser ||
    //   this.device === DeviceType.EdgeBrowser ||
    //   this.device === DeviceType.FirefoxBrowser ||
    //   this.device === DeviceType.OperaBrowser ||
    //   this.device === DeviceType.SafariBrowser ||
    //   this.device === DeviceType.UnknownBrowser ||
    //   this.device === DeviceType.VivaldiBrowser;
  }

  //#region Token Management Methods

  // TODO: revert methods to master implementation

  async postIdentityToken(
    request: UserApiTokenRequest | PasswordTokenRequest | SsoTokenRequest
  ): Promise<IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse> {
    const identityToken =
      request instanceof UserApiTokenRequest
        ? request.toIdentityToken()
        : request.toIdentityToken(this.platformUtilsService.getClientType());

    const fetchReq = await this.apiHelperService.createRequest(
      "POST",
      this.identityBaseUrl + "/connect/token",
      this.apiHelperService.qsStringify(identityToken),
      true,
      request.alterIdentityTokenHeaders
    );

    const response = await this.apiHelperService.fetch(fetchReq);

    let responseJson: any = null;
    if (this.apiHelperService.isJsonResponse(response)) {
      responseJson = await response.json();
    }

    if (responseJson != null) {
      if (response.status === 200) {
        return new IdentityTokenResponse(responseJson);
      } else if (
        response.status === 400 &&
        responseJson.TwoFactorProviders2 &&
        Object.keys(responseJson.TwoFactorProviders2).length
      ) {
        return new IdentityTwoFactorResponse(responseJson);
      } else if (
        response.status === 400 &&
        responseJson.HCaptcha_SiteKey &&
        Object.keys(responseJson.HCaptcha_SiteKey).length
      ) {
        return new IdentityCaptchaResponse(responseJson);
      }
    }

    return Promise.reject(new ErrorResponse(responseJson, response.status, true));
  }

  // TODO: consider refactoring back to just use createRequest and not send
  async renewAuthViaRefreshToken(
    refreshToken: string,
    decodedAccessToken: any
  ): Promise<IdentityTokenResponse> {
    if (refreshToken == null || refreshToken === "") {
      throw new Error();
    }

    const responseJson = await this.apiHelperService.send(
      "POST",
      this.identityBaseUrl + "/connect/token",
      this.apiHelperService.qsStringify({
        grant_type: "refresh_token",
        client_id: decodedAccessToken.client_id,
        refresh_token: refreshToken,
      }),
      true
    );

    return new IdentityTokenResponse(responseJson);
  }

  async refreshIdentityToken(): Promise<any> {
    try {
      await this.doAuthRefresh();
    } catch (e) {
      return Promise.reject(null);
    }
  }

  async getActiveAccessToken(): Promise<string> {
    let accessToken = await this.tokenService.getAccessToken();
    if (await this.tokenService.accessTokenNeedsRefresh()) {
      await this.doAuthRefresh();
      accessToken = await this.tokenService.getAccessToken();
    }
    return accessToken;
  }

  // TODO: refreshAuthTokens?

  // A better name for the doAuthRefresh method could be refreshAuthenticationTokens, refreshAuthTokens, or refreshTokens.
  // These names more clearly indicate that the method is refreshing authentication tokens
  // (both access token and refresh token) and/or API keys, depending on what is available, and not just a single token.

  private async doAuthRefresh(): Promise<void> {
    // if we have a refresh token, use it to get a new access token and refresh token
    const refreshToken = await this.tokenService.getRefreshToken();
    if (refreshToken != null && refreshToken !== "") {
      const decodedAccessToken = await this.tokenService.decodeAccessToken();
      const tokenResponse = await this.renewAuthViaRefreshToken(refreshToken, decodedAccessToken);
      await this.tokenService.setTokens(
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
        null
      );
    }

    // if we have api keys, use them to get a new access token and refresh token
    const clientId = await this.tokenService.getClientId();
    const clientSecret = await this.tokenService.getClientSecret();
    if (!Utils.isNullOrWhitespace(clientId) && !Utils.isNullOrWhitespace(clientSecret)) {
      return this.doApiTokenRefresh(clientId, clientSecret);
    }

    throw new Error("Cannot refresh token, no refresh token or api keys are stored");
  }

  // TODO: consider renaming something like renewAuthViaClientCreds
  private async doApiTokenRefresh(clientId: string, clientSecret: string): Promise<void> {
    const appId = await this.appIdService.getAppId();
    const deviceRequest = new DeviceRequest(appId, this.platformUtilsService);
    const tokenRequest = new UserApiTokenRequest(
      clientId,
      clientSecret,
      new TokenTwoFactorRequest(),
      deviceRequest
    );

    const response = await this.postIdentityToken(tokenRequest);
    if (!(response instanceof IdentityTokenResponse)) {
      throw new Error("Invalid response received when refreshing api token");
    }

    await this.tokenService.setAccessToken(response.accessToken);
  }

  // A request that includes a client ID and secret is commonly used for
  // authentication purposes in APIs, and is often referred to as an "OAuth2 client credentials grant request".
  // OAuth2 is a protocol used for secure authorization and authentication of API clients.
  // The client credentials grant is a type of OAuth2 grant flow that allows a client application
  // to obtain an access token using its own client ID and secret, without needing to involve a user
  //  in the authorization process.
  // In this flow, the client application sends a request to the authorization server that includes
  //  its client ID and secret, and receives an access token in response, which can then be used to
  // access protected resources on behalf of the client.

  // An API token is a unique identifier that is used to authenticate and authorize requests made
  // to an API (Application Programming Interface). It is a string of characters that is issued by an
  // API provider to an API consumer (such as a client application or a user), and is used as a credential
  // to access protected resources or perform specific actions on the API.

  // API tokens can take different forms, such as OAuth2 access tokens, JSON Web Tokens (JWTs), or API keys.
  // They are typically generated by the API provider and can have different lifetimes, scopes, and levels of access.

  // API tokens are important for API security because they allow the API provider to control and monitor
  // who can access the API and what actions they can perform. They also enable the API consumer to make
  // authenticated requests without having to reveal their username and password, which reduces
  // the risk of credential theft and misuse.
}

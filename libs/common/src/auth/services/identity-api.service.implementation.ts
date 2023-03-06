// import { PreloginRequest } from "@bitwarden/common/models/request/prelogin.request";

import { ApiService } from "../../abstractions/api.service";
import { EnvironmentService } from "../../abstractions/environment.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { PreloginRequest } from "../../models/request/prelogin.request";
import { ErrorResponse } from "../../models/response/error.response";
import { IdentityApiService } from "../abstractions/identity-api.service";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";
import { PreloginResponse } from "../models/response/prelogin.response";

import { TokenService } from "./token.service";

export class IdentityApiServiceImplementation implements IdentityApiService {
  private identityBaseUrl: string = this.environmentService.getIdentityUrl();

  constructor(
    private tokenService: TokenService,
    private platformUtilsService: PlatformUtilsService,
    private environmentService: EnvironmentService,
    private apiService: ApiService
  ) {}

  async postIdentityToken(
    request: UserApiTokenRequest | PasswordTokenRequest | SsoTokenRequest
  ): Promise<IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse> {
    const identityToken =
      request instanceof UserApiTokenRequest
        ? request.toIdentityToken()
        : request.toIdentityToken(this.platformUtilsService.getClientType());

    const fetchReq = await this.apiService.createRequest(
      "POST",
      this.identityBaseUrl + "/connect/token",
      this.apiService.qsStringify(identityToken),
      false,
      true,
      request.alterIdentityTokenHeaders
    );

    const response = await this.apiService.fetch(fetchReq);

    let responseJson: any = null;
    if (this.apiService.isJsonResponse(response)) {
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
        await this.tokenService.clearTwoFactorToken();
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

  async renewAuthViaRefreshToken(): Promise<any> {
    const refreshToken = await this.tokenService.getRefreshToken();
    if (refreshToken == null || refreshToken === "") {
      throw new Error();
    }

    const decodedAccessToken = await this.tokenService.decodeAccessToken();

    const responseJson = await this.apiService.send(
      "POST",
      this.identityBaseUrl + "/connect/token",
      this.apiService.qsStringify({
        grant_type: "refresh_token",
        client_id: decodedAccessToken.client_id,
        refresh_token: refreshToken,
      }),
      false,
      true
    );

    const tokenResponse = new IdentityTokenResponse(responseJson);
    await this.tokenService.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken, null);
  }

  async postPrelogin(request: PreloginRequest): Promise<PreloginResponse> {
    const r = await this.apiService.send(
      "POST",
      "/accounts/prelogin",
      request,
      false,
      true,
      this.identityBaseUrl
    );
    return new PreloginResponse(r);
  }
}

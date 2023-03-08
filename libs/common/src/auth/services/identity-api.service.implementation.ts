// import { PreloginRequest } from "@bitwarden/common/models/request/prelogin.request";

import { ApiService } from "../../abstractions/api.service";
import { EnvironmentService } from "../../abstractions/environment.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { RegisterRequest } from "../../models/request/register.request";
import { ErrorResponse } from "../../models/response/error.response";
import { IdentityApiService } from "../abstractions/identity-api.service";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { PreloginRequest } from "../models/request/prelogin.request";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";
import { PreloginResponse } from "../models/response/prelogin.response";
import { RegisterResponse } from "../models/response/register.response";

export class IdentityApiServiceImplementation implements IdentityApiService {
  private identityBaseUrl: string = this.environmentService.getIdentityUrl();

  constructor(
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

  async renewAuthViaRefreshToken(
    refreshToken: string,
    decodedAccessToken: any
  ): Promise<IdentityTokenResponse> {
    if (refreshToken == null || refreshToken === "") {
      throw new Error();
    }

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

    return new IdentityTokenResponse(responseJson);
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

  // TODO: figure out if I'm supposed to be moving requests to auth > requests or not. Moved PreLoginRequest already.
  async postRegister(request: RegisterRequest): Promise<RegisterResponse> {
    const r = await this.apiService.send(
      "POST",
      "/accounts/register",
      request,
      false,
      true,
      this.identityBaseUrl
    );
    return new RegisterResponse(r);
  }
}

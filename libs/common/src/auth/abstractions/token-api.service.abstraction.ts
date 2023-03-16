import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";

export abstract class TokenApiService {
  postIdentityToken: (
    request: PasswordTokenRequest | SsoTokenRequest | UserApiTokenRequest
  ) => Promise<IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse>;

  renewAuthViaRefreshToken: (
    refreshToken: string,
    decodedAccessToken: any
  ) => Promise<IdentityTokenResponse>;

  refreshIdentityToken: () => Promise<any>;
  getActiveAccessToken: () => Promise<string>;
}

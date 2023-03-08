import { RegisterRequest } from "../../models/request/register.request";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { SsoTokenRequest } from "../models/request/identity-token/sso-token.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { PreloginRequest } from "../models/request/prelogin.request";
import { IdentityCaptchaResponse } from "../models/response/identity-captcha.response";
import { IdentityTokenResponse } from "../models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "../models/response/identity-two-factor.response";
import { PreloginResponse } from "../models/response/prelogin.response";
import { RegisterResponse } from "../models/response/register.response";

// TODO: figure out if this should have Abstraction suffix in file & class name
export abstract class IdentityApiService {
  postIdentityToken: (
    request: PasswordTokenRequest | SsoTokenRequest | UserApiTokenRequest
  ) => Promise<IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse>;

  renewAuthViaRefreshToken: (
    refreshToken: string,
    decodedAccessToken: any
  ) => Promise<IdentityTokenResponse>;

  postPrelogin: (request: PreloginRequest) => Promise<PreloginResponse>;

  postRegister: (request: RegisterRequest) => Promise<RegisterResponse>;
}

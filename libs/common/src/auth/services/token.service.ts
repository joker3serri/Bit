import { AppIdService } from "../../abstractions/appId.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { Utils } from "../../misc/utils";
import { IdentityApiService } from "../abstractions/identity-api.service";
import { TokenService as TokenServiceAbstraction } from "../abstractions/token.service";
import { DeviceRequest } from "../models/request/identity-token/device.request";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";
import { UserApiTokenRequest } from "../models/request/identity-token/user-api-token.request";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

export class TokenService implements TokenServiceAbstraction {
  // TODO: add type for JWT token
  static decodeJwtToken(token: string): Promise<any> {
    if (token == null) {
      throw new Error("Token not provided.");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT must have 3 parts");
    }

    const decoded = Utils.fromUrlB64ToUtf8(parts[1]);
    if (decoded == null) {
      throw new Error("Cannot decode the token");
    }

    const decodedToken = JSON.parse(decoded);
    return decodedToken;
  }

  constructor(
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService,
    private appIdService: AppIdService,
    private identityApiService: IdentityApiService
  ) {}

  async setTokens(
    accessToken: string,
    refreshToken: string,
    clientIdClientSecret: [string, string]
  ): Promise<any> {
    await this.setAccessToken(accessToken);
    await this.setRefreshToken(refreshToken);
    if (clientIdClientSecret != null) {
      await this.setClientId(clientIdClientSecret[0]);
      await this.setClientSecret(clientIdClientSecret[1]);
    }
  }

  async setClientId(clientId: string): Promise<any> {
    return await this.stateService.setApiKeyClientId(clientId);
  }

  async getClientId(): Promise<string> {
    return await this.stateService.getApiKeyClientId();
  }

  async setClientSecret(clientSecret: string): Promise<any> {
    return await this.stateService.setApiKeyClientSecret(clientSecret);
  }

  async getClientSecret(): Promise<string> {
    return await this.stateService.getApiKeyClientSecret();
  }

  async setAccessToken(token: string): Promise<void> {
    await this.stateService.setAccessToken(token);
  }

  async getAccessToken(): Promise<string> {
    return await this.stateService.getAccessToken();
  }

  async setRefreshToken(refreshToken: string): Promise<any> {
    return await this.stateService.setRefreshToken(refreshToken);
  }

  async getRefreshToken(): Promise<string> {
    return await this.stateService.getRefreshToken();
  }

  async setTwoFactorToken(tokenResponse: IdentityTokenResponse): Promise<any> {
    return await this.stateService.setTwoFactorToken(tokenResponse.twoFactorToken);
  }

  async getTwoFactorToken(): Promise<string> {
    return await this.stateService.getTwoFactorToken();
  }

  async clearTwoFactorToken(): Promise<any> {
    return await this.stateService.setTwoFactorToken(null);
  }

  async clearTokens(userId?: string): Promise<any> {
    await this.stateService.setAccessToken(null, { userId: userId });
    await this.stateService.setRefreshToken(null, { userId: userId });
    await this.stateService.setApiKeyClientId(null, { userId: userId });
    await this.stateService.setApiKeyClientSecret(null, { userId: userId });
  }

  // jwthelper methods
  // ref https://github.com/auth0/angular-jwt/blob/master/src/angularJwt/services/jwt.js

  async decodeAccessToken(token?: string): Promise<any> {
    token = token ?? (await this.stateService.getAccessToken());

    if (token == null) {
      throw new Error("Token not found.");
    }

    return TokenService.decodeJwtToken(token);
  }

  async getAccessTokenExpirationDate(): Promise<Date> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.exp === "undefined") {
      return null;
    }

    const d = new Date(0); // The 0 here is the key, which sets the date to the epoch
    d.setUTCSeconds(decoded.exp);
    return d;
  }

  async accessTokenSecondsRemaining(offsetSeconds = 0): Promise<number> {
    const expDate = await this.getAccessTokenExpirationDate();
    if (expDate == null) {
      return 0;
    }

    const msRemaining = expDate.valueOf() - (new Date().valueOf() + offsetSeconds * 1000);
    return Math.round(msRemaining / 1000);
  }

  async accessTokenNeedsRefresh(minutes = 5): Promise<boolean> {
    const sRemaining = await this.accessTokenSecondsRemaining();
    return sRemaining < 60 * minutes;
  }

  async getUserIdFromAccessToken(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.sub === "undefined") {
      throw new Error("No user id found");
    }

    return decoded.sub as string;
  }

  async getEmailFromAccessToken(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.email === "undefined") {
      throw new Error("No email found");
    }

    return decoded.email as string;
  }

  async getEmailVerifiedFromAccessToken(): Promise<boolean> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.email_verified === "undefined") {
      throw new Error("No email verification found");
    }

    return decoded.email_verified as boolean;
  }

  async getNameFromAccessToken(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.name === "undefined") {
      return null;
    }

    return decoded.name as string;
  }

  async getIssuerFromAccessToken(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.iss === "undefined") {
      throw new Error("No issuer found");
    }

    return decoded.iss as string;
  }

  async getIsExternalFromAccessToken(): Promise<boolean> {
    const decoded = await this.decodeAccessToken();

    return Array.isArray(decoded.amr) && decoded.amr.includes("external");
  }

  async refreshIdentityToken(): Promise<any> {
    try {
      await this.doAuthRefresh();
    } catch (e) {
      return Promise.reject(null);
    }
  }

  async getActiveAccessToken(): Promise<string> {
    let accessToken = await this.getAccessToken();
    if (await this.accessTokenNeedsRefresh()) {
      await this.doAuthRefresh();
      accessToken = await this.getAccessToken();
    }
    return accessToken;
  }

  private async doAuthRefresh(): Promise<void> {
    // if we have a refresh token, use it to get a new access token and refresh token
    const refreshToken = await this.getRefreshToken();
    if (refreshToken != null && refreshToken !== "") {
      const decodedAccessToken = await this.decodeAccessToken();
      const tokenResponse = await this.identityApiService.renewAuthViaRefreshToken(
        refreshToken,
        decodedAccessToken
      );
      await this.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken, null);
    }

    // if we have api keys, use them to get a new access token and refresh token
    const clientId = await this.getClientId();
    const clientSecret = await this.getClientSecret();
    if (!Utils.isNullOrWhitespace(clientId) && !Utils.isNullOrWhitespace(clientSecret)) {
      return this.doApiTokenRefresh(clientId, clientSecret);
    }

    throw new Error("Cannot refresh token, no refresh token or api keys are stored");
  }

  private async doApiTokenRefresh(clientId: string, clientSecret: string): Promise<void> {
    const appId = await this.appIdService.getAppId();
    const deviceRequest = new DeviceRequest(appId, this.platformUtilsService);
    const tokenRequest = new UserApiTokenRequest(
      clientId,
      clientSecret,
      new TokenTwoFactorRequest(),
      deviceRequest
    );

    const response = await this.identityApiService.postIdentityToken(tokenRequest);
    if (!(response instanceof IdentityTokenResponse)) {
      throw new Error("Invalid response received when refreshing api token");
    }

    await this.setAccessToken(response.accessToken);
  }
}

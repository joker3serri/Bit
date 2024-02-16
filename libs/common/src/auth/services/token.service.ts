import { firstValueFrom } from "rxjs";

import { VaultTimeoutSettingsService } from "../../abstractions/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { StateService } from "../../platform/abstractions/state.service";
import { Utils } from "../../platform/misc/utils";
import { ActiveUserState, StateProvider } from "../../platform/state";
import { UserId } from "../../types/guid";
import { TokenService as TokenServiceAbstraction } from "../abstractions/token.service";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

import {
  ACCESS_TOKEN_DISK,
  ACCESS_TOKEN_MEMORY,
  API_KEY_CLIENT_ID_DISK,
  API_KEY_CLIENT_ID_MEMORY,
  API_KEY_CLIENT_SECRET_DISK,
  API_KEY_CLIENT_SECRET_MEMORY,
  REFRESH_TOKEN_DISK,
  REFRESH_TOKEN_MEMORY,
  TWO_FACTOR_TOKEN_DISK_LOCAL,
} from "./token.state";

export class TokenService implements TokenServiceAbstraction {
  static decodeToken(token: string): Promise<any> {
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

  private accessTokenDiskState: ActiveUserState<string>;
  private accessTokenMemoryState: ActiveUserState<string>;

  private refreshTokenDiskState: ActiveUserState<string>;
  private refreshTokenMemoryState: ActiveUserState<string>;

  private twoFactorTokenDiskLocalState: ActiveUserState<string>;

  private apiKeyClientIdDiskState: ActiveUserState<string>;
  private apiKeyClientIdMemoryState: ActiveUserState<string>;

  private apiKeyClientSecretDiskState: ActiveUserState<string>;
  private apiKeyClientSecretMemoryState: ActiveUserState<string>;

  constructor(
    private stateService: StateService,
    private stateProvider: StateProvider,
    // TODO: Idea: use VaultTimeoutSettingsService key definitions?
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
  ) {
    this.initializeState();
  }

  private initializeState(): void {
    this.accessTokenDiskState = this.stateProvider.getActive(ACCESS_TOKEN_DISK);
    this.accessTokenMemoryState = this.stateProvider.getActive(ACCESS_TOKEN_MEMORY);

    this.refreshTokenDiskState = this.stateProvider.getActive(REFRESH_TOKEN_DISK);
    this.refreshTokenMemoryState = this.stateProvider.getActive(REFRESH_TOKEN_MEMORY);

    this.twoFactorTokenDiskLocalState = this.stateProvider.getActive(TWO_FACTOR_TOKEN_DISK_LOCAL);

    this.apiKeyClientIdDiskState = this.stateProvider.getActive(API_KEY_CLIENT_ID_DISK);
    this.apiKeyClientIdMemoryState = this.stateProvider.getActive(API_KEY_CLIENT_ID_MEMORY);

    this.apiKeyClientSecretDiskState = this.stateProvider.getActive(API_KEY_CLIENT_SECRET_DISK);
    this.apiKeyClientSecretMemoryState = this.stateProvider.getActive(API_KEY_CLIENT_SECRET_MEMORY);
  }

  async setTokens(
    accessToken: string,
    refreshToken: string,
    clientIdClientSecret: [string, string],
  ): Promise<any> {
    await this.setToken(accessToken);
    await this.setRefreshToken(refreshToken);
    if (clientIdClientSecret != null) {
      await this.setClientId(clientIdClientSecret[0]);
      await this.setClientSecret(clientIdClientSecret[1]);
    }
  }

  async setToken(token: string): Promise<void> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      await this.accessTokenDiskState.update((_) => token);
    } else if (storageLocation === "memory") {
      await this.accessTokenMemoryState.update((_) => token);
    }
  }

  async getToken(): Promise<string> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      return await firstValueFrom(this.accessTokenDiskState.state$);
    } else if (storageLocation === "memory") {
      return await firstValueFrom(this.accessTokenMemoryState.state$);
    }
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      await this.refreshTokenDiskState.update((_) => refreshToken);
    } else if (storageLocation === "memory") {
      await this.refreshTokenMemoryState.update((_) => refreshToken);
    }
  }

  async getRefreshToken(): Promise<string> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      return await firstValueFrom(this.refreshTokenDiskState.state$);
    } else if (storageLocation === "memory") {
      return await firstValueFrom(this.refreshTokenMemoryState.state$);
    }
  }

  async setClientId(clientId: string): Promise<void> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      await this.apiKeyClientIdDiskState.update((_) => clientId);
    } else if (storageLocation === "memory") {
      await this.apiKeyClientIdMemoryState.update((_) => clientId);
    }
  }

  async getClientId(): Promise<string> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      return await firstValueFrom(this.apiKeyClientIdDiskState.state$);
    } else if (storageLocation === "memory") {
      return await firstValueFrom(this.apiKeyClientIdMemoryState.state$);
    }
  }

  async setClientSecret(clientSecret: string): Promise<void> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      await this.apiKeyClientSecretDiskState.update((_) => clientSecret);
    } else if (storageLocation === "memory") {
      await this.apiKeyClientSecretMemoryState.update((_) => clientSecret);
    }
  }

  async getClientSecret(): Promise<string> {
    const storageLocation = await this.determineStorageLocation();

    if (storageLocation === "disk") {
      return await firstValueFrom(this.apiKeyClientSecretDiskState.state$);
    } else if (storageLocation === "memory") {
      return await firstValueFrom(this.apiKeyClientSecretMemoryState.state$);
    }
  }

  async setTwoFactorToken(tokenResponse: IdentityTokenResponse): Promise<void> {
    await this.twoFactorTokenDiskLocalState.update((_) => tokenResponse.twoFactorToken);
  }

  async getTwoFactorToken(): Promise<string> {
    return await firstValueFrom(this.twoFactorTokenDiskLocalState.state$);
  }

  async clearTwoFactorToken(): Promise<void> {
    await this.twoFactorTokenDiskLocalState.update((_) => null);
  }

  // TODO: consider renaming this method as it also clears the client id and secret which aren't
  async clearToken(): Promise<void> {
    await this.setToken(null);
    await this.setRefreshToken(null);
    await this.setClientId(null);
    await this.setClientSecret(null);
  }

  // jwthelper methods
  // ref https://github.com/auth0/angular-jwt/blob/master/src/angularJwt/services/jwt.js

  async decodeToken(token?: string): Promise<any> {
    token = token ?? (await this.getToken());

    if (token == null) {
      throw new Error("Token not found.");
    }

    return TokenService.decodeToken(token);
  }

  async getTokenExpirationDate(): Promise<Date> {
    const decoded = await this.decodeToken();
    if (typeof decoded.exp === "undefined") {
      return null;
    }

    const d = new Date(0); // The 0 here is the key, which sets the date to the epoch
    d.setUTCSeconds(decoded.exp);
    return d;
  }

  async tokenSecondsRemaining(offsetSeconds = 0): Promise<number> {
    const d = await this.getTokenExpirationDate();
    if (d == null) {
      return 0;
    }

    const msRemaining = d.valueOf() - (new Date().valueOf() + offsetSeconds * 1000);
    return Math.round(msRemaining / 1000);
  }

  async tokenNeedsRefresh(minutes = 5): Promise<boolean> {
    const sRemaining = await this.tokenSecondsRemaining();
    return sRemaining < 60 * minutes;
  }

  async getUserId(): Promise<string> {
    const decoded = await this.decodeToken();
    if (typeof decoded.sub === "undefined") {
      throw new Error("No user id found");
    }

    return decoded.sub as string;
  }

  async getEmail(): Promise<string> {
    const decoded = await this.decodeToken();
    if (typeof decoded.email === "undefined") {
      throw new Error("No email found");
    }

    return decoded.email as string;
  }

  async getEmailVerified(): Promise<boolean> {
    const decoded = await this.decodeToken();
    if (typeof decoded.email_verified === "undefined") {
      throw new Error("No email verification found");
    }

    return decoded.email_verified as boolean;
  }

  async getName(): Promise<string> {
    const decoded = await this.decodeToken();
    if (typeof decoded.name === "undefined") {
      return null;
    }

    return decoded.name as string;
  }

  async getIssuer(): Promise<string> {
    const decoded = await this.decodeToken();
    if (typeof decoded.iss === "undefined") {
      throw new Error("No issuer found");
    }

    return decoded.iss as string;
  }

  async getIsExternal(): Promise<boolean> {
    const decoded = await this.decodeToken();

    return Array.isArray(decoded.amr) && decoded.amr.includes("external");
  }

  private async determineStorageLocation(userId?: UserId): Promise<"disk" | "memory"> {
    const [timeoutAction, timeout] = await Promise.all([
      firstValueFrom(this.vaultTimeoutSettingsService.vaultTimeoutAction$(userId)),
      this.vaultTimeoutSettingsService.getVaultTimeout(userId),
    ]);

    if (timeoutAction === VaultTimeoutAction.LogOut && timeout != null) {
      return "memory";
    } else {
      return "disk";
    }
  }

  // private async determineStorageLocationWithParams(
  //   timeout: number,
  //   timeoutAction: VaultTimeoutAction,
  //   userId?: UserId,
  // ): Promise<"disk" | "memory"> {
  //   if (timeoutAction === VaultTimeoutAction.LogOut && timeout != null) {
  //     return "memory";
  //   } else {
  //     return "disk";
  //   }
  // }
}

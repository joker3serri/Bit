import { firstValueFrom } from "rxjs";

import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";
import { StorageLocation } from "../../platform/enums";
import { Utils } from "../../platform/misc/utils";
import { ActiveUserState, GlobalState, StateProvider } from "../../platform/state";
import { UserId } from "../../types/guid";
import { TokenService as TokenServiceAbstraction } from "../abstractions/token.service";

import {
  ACCESS_TOKEN_DISK,
  ACCESS_TOKEN_MEMORY,
  API_KEY_CLIENT_ID_DISK,
  API_KEY_CLIENT_ID_MEMORY,
  API_KEY_CLIENT_SECRET_DISK,
  API_KEY_CLIENT_SECRET_MEMORY,
  EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL,
  REFRESH_TOKEN_DISK,
  REFRESH_TOKEN_MEMORY,
} from "./token.state";

// TODO: write tests for this service

export class TokenService implements TokenServiceAbstraction {
  static decodeAccessToken(token: string): Promise<any> {
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

  private readonly platformSupportsSecureStorage =
    this.platformUtilsService.supportsSecureStorage();

  private accessTokenDiskState: ActiveUserState<string>;
  private accessTokenMemoryState: ActiveUserState<string>;
  private readonly accessTokenSecureStorageKey: string = "_accessToken";

  private refreshTokenDiskState: ActiveUserState<string>;
  private refreshTokenMemoryState: ActiveUserState<string>;
  private readonly refreshTokenSecureStorageKey: string = "_refreshToken";

  private apiKeyClientIdDiskState: ActiveUserState<string>;
  private apiKeyClientIdMemoryState: ActiveUserState<string>;

  private apiKeyClientSecretDiskState: ActiveUserState<string>;
  private apiKeyClientSecretMemoryState: ActiveUserState<string>;

  private emailTwoFactorTokenRecordGlobalState: GlobalState<Record<string, string>>;

  constructor(
    private stateProvider: StateProvider,
    private platformUtilsService: PlatformUtilsService,
    private secureStorageService: AbstractStorageService,
  ) {
    this.initializeState();
  }

  private initializeState(): void {
    this.accessTokenDiskState = this.stateProvider.getActive(ACCESS_TOKEN_DISK);
    this.accessTokenMemoryState = this.stateProvider.getActive(ACCESS_TOKEN_MEMORY);

    this.refreshTokenDiskState = this.stateProvider.getActive(REFRESH_TOKEN_DISK);
    this.refreshTokenMemoryState = this.stateProvider.getActive(REFRESH_TOKEN_MEMORY);

    this.apiKeyClientIdDiskState = this.stateProvider.getActive(API_KEY_CLIENT_ID_DISK);
    this.apiKeyClientIdMemoryState = this.stateProvider.getActive(API_KEY_CLIENT_ID_MEMORY);

    this.apiKeyClientSecretDiskState = this.stateProvider.getActive(API_KEY_CLIENT_SECRET_DISK);
    this.apiKeyClientSecretMemoryState = this.stateProvider.getActive(API_KEY_CLIENT_SECRET_MEMORY);

    this.emailTwoFactorTokenRecordGlobalState = this.stateProvider.getGlobal(
      EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL,
    );
  }

  async setTokens(
    accessToken: string,
    refreshToken: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
    clientIdClientSecret?: [string, string],
  ): Promise<any> {
    // get user id from saved or passed in access token so we can save the tokens to secure storage
    let userId: UserId;
    if (accessToken == null) {
      userId = (await this.getUserId()) as UserId;
    } else {
      const decodedAccessToken = await this.decodeAccessToken(accessToken);
      userId = decodedAccessToken.sub;
    }

    await this.setAccessToken(accessToken, vaultTimeoutAction, vaultTimeout, userId);
    await this.setRefreshToken(refreshToken, vaultTimeoutAction, vaultTimeout, userId);
    if (clientIdClientSecret != null) {
      await this.setClientId(clientIdClientSecret[0], vaultTimeoutAction, vaultTimeout);
      await this.setClientSecret(clientIdClientSecret[1], vaultTimeoutAction, vaultTimeout);
    }
  }

  async setAccessToken(
    token: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
    userId?: UserId,
  ): Promise<void> {
    if (this.platformSupportsSecureStorage) {
      // if we don't have a user id, see if we can get one from the state provider active user
      if (!userId) {
        userId = await firstValueFrom(this.stateProvider.activeUserId$);
      }

      // If we don't have a user id, we can't save to secure storage
      if (!userId) {
        throw new Error(
          "User id not found in access token. Cannot save access token to secure storage.",
        );
      }

      await this.secureStorageService.save<string>(
        `${userId}${this.accessTokenSecureStorageKey}`,
        token,
        {
          storageLocation: StorageLocation.Disk,
          useSecureStorage: true,
          userId: userId,
        },
      );

      // TODO: make Jira ticket for this
      // 2024-02-20: Remove access token from memory and disk so that we migrate to secure storage over time.
      // Remove after 3 releases.
      // Turn this into a migrate function + add disk state for a boolean to track if we've migrated
      await this.accessTokenDiskState.update((_) => null);
      await this.accessTokenMemoryState.update((_) => null);

      return;
    }

    // Platform doesn't support secure storage, so use state provider implementation
    const storageLocation = await this.determineStorageLocation(vaultTimeoutAction, vaultTimeout);

    if (storageLocation === "disk") {
      await this.accessTokenDiskState.update((_) => token);
    } else if (storageLocation === "memory") {
      await this.accessTokenMemoryState.update((_) => token);
    }
  }

  async clearAccessTokenByUserId(userId: UserId): Promise<void> {
    if (this.platformSupportsSecureStorage) {
      await this.secureStorageService.remove(`${userId}${this.accessTokenSecureStorageKey}`, {
        storageLocation: StorageLocation.Disk,
        useSecureStorage: true,
        userId: userId,
      });
      return;
    }

    // Platform doesn't support secure storage, so use state provider implementation
    await this.stateProvider.setUserState(ACCESS_TOKEN_DISK, null, userId);
    await this.stateProvider.setUserState(ACCESS_TOKEN_MEMORY, null, userId);
  }

  async getAccessToken(userId?: UserId): Promise<string> {
    // pre-secure storage migration:
    // if user id, read from user
    if (userId) {
      const accessTokenForUser = await this.getAccessTokenByUserId(userId);

      if (accessTokenForUser) {
        return accessTokenForUser;
      }
    }

    // if no user id, read from active user in memory (memory first b/c faster)
    const accessTokenMemory = await firstValueFrom(this.accessTokenMemoryState.state$);
    if (accessTokenMemory != null) {
      return accessTokenMemory;
    }

    // if memory is null, read from active user on disk
    const accessTokenDisk = await firstValueFrom(this.accessTokenDiskState.state$);
    if (accessTokenDisk != null) {
      return accessTokenDisk;
    }

    // Data not found in memory or disk, try secure storage as it could have been migrated if the platform supported it
    if (this.platformSupportsSecureStorage) {
      // if we don't have a user id, we have to have one in order to read from secure storage
      if (!userId) {
        userId = await firstValueFrom(this.stateProvider.activeUserId$);
      }

      // if we still don't have a user id, we can't read from secure storage
      if (!userId) {
        return null;
      }

      const accessToken = await this.secureStorageService.get<string>(
        `${userId}${this.accessTokenSecureStorageKey}`,
        {
          storageLocation: StorageLocation.Disk,
          useSecureStorage: true,
          userId: userId,
        },
      );

      if (accessToken != null) {
        return accessToken;
      }
    }

    return null;
  }

  private async getAccessTokenByUserId(userId: UserId): Promise<string> {
    // Always read memory first b/c faster
    const accessTokenMemory = await firstValueFrom(
      this.stateProvider.getUser(userId, ACCESS_TOKEN_MEMORY).state$,
    );

    if (accessTokenMemory != null) {
      return accessTokenMemory;
    }

    // if memory is null, read from disk
    return await firstValueFrom(this.stateProvider.getUser(userId, ACCESS_TOKEN_DISK).state$);
  }

  // Private because we only ever set the refresh token when also setting the access token
  // and we need the user id from the access token to save to secure storage
  private async setRefreshToken(
    refreshToken: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
    userId: UserId,
  ): Promise<void> {
    if (this.platformSupportsSecureStorage) {
      // If we don't have a user id, we can't save to secure storage
      if (!userId) {
        throw new Error("User id null. Cannot save refresh token to secure storage.");
      }

      await this.secureStorageService.save<string>(
        `${userId}${this.refreshTokenSecureStorageKey}`,
        refreshToken,
        {
          storageLocation: StorageLocation.Disk,
          useSecureStorage: true,
          userId: userId,
        },
      );

      // 2024-02-20: Remove refresh token from memory and disk so that we migrate to secure storage over time.
      // Remove after 3 releases.
      await this.refreshTokenDiskState.update((_) => null);
      await this.refreshTokenMemoryState.update((_) => null);

      return;
    }

    const storageLocation = await this.determineStorageLocation(vaultTimeoutAction, vaultTimeout);

    if (storageLocation === "disk") {
      await this.refreshTokenDiskState.update((_) => refreshToken);
    } else if (storageLocation === "memory") {
      await this.refreshTokenMemoryState.update((_) => refreshToken);
    }
  }

  async getRefreshToken(): Promise<string> {
    // pre-secure storage migration:
    // Always read memory first b/c faster
    const refreshTokenMemory = await firstValueFrom(this.refreshTokenMemoryState.state$);

    if (refreshTokenMemory != null) {
      return refreshTokenMemory;
    }

    // if memory is null, read from disk
    const refreshTokenDisk = await firstValueFrom(this.refreshTokenDiskState.state$);
    if (refreshTokenDisk != null) {
      return refreshTokenDisk;
    }

    // Data not found in memory or disk, try secure storage as it could have been
    // migrated if the platform supported it
    if (this.platformSupportsSecureStorage) {
      // get user id from active user as we need it to read from secure storage
      const userId = await firstValueFrom(this.stateProvider.activeUserId$);

      // if we still don't have a user id, we can't read from secure storage
      if (!userId) {
        return null;
      }

      const refreshTokenSecureStorage = await this.secureStorageService.get<string>(
        `${userId}${this.refreshTokenSecureStorageKey}`,
        {
          storageLocation: StorageLocation.Disk,
          useSecureStorage: true,
          userId: userId,
        },
      );

      if (refreshTokenSecureStorage != null) {
        return refreshTokenSecureStorage;
      }
    }

    return null;
  }

  async setClientId(
    clientId: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ): Promise<void> {
    const storageLocation = await this.determineStorageLocation(vaultTimeoutAction, vaultTimeout);

    if (storageLocation === "disk") {
      await this.apiKeyClientIdDiskState.update((_) => clientId);
    } else if (storageLocation === "memory") {
      await this.apiKeyClientIdMemoryState.update((_) => clientId);
    }
  }

  async getClientId(): Promise<string> {
    // Always read memory first b/c faster
    const apiKeyClientIdMemory = await firstValueFrom(this.apiKeyClientIdMemoryState.state$);

    if (apiKeyClientIdMemory != null) {
      return apiKeyClientIdMemory;
    }

    // if memory is null, read from disk
    return await firstValueFrom(this.apiKeyClientIdDiskState.state$);
  }

  async setClientSecret(
    clientSecret: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ): Promise<void> {
    const storageLocation = await this.determineStorageLocation(vaultTimeoutAction, vaultTimeout);

    if (storageLocation === "disk") {
      await this.apiKeyClientSecretDiskState.update((_) => clientSecret);
    } else if (storageLocation === "memory") {
      await this.apiKeyClientSecretMemoryState.update((_) => clientSecret);
    }
  }

  async getClientSecret(): Promise<string> {
    // Always read memory first b/c faster
    const apiKeyClientSecretMemory = await firstValueFrom(
      this.apiKeyClientSecretMemoryState.state$,
    );

    if (apiKeyClientSecretMemory != null) {
      return apiKeyClientSecretMemory;
    }

    // if memory is null, read from disk
    return await firstValueFrom(this.apiKeyClientSecretDiskState.state$);
  }

  async setTwoFactorToken(email: string, twoFactorToken: string): Promise<void> {
    await this.emailTwoFactorTokenRecordGlobalState.update((emailTwoFactorTokenRecord) => {
      emailTwoFactorTokenRecord[email] = twoFactorToken;
      return emailTwoFactorTokenRecord;
    });
  }

  async getTwoFactorToken(email: string): Promise<string> {
    const emailTwoFactorTokenRecord: Record<string, string> = await firstValueFrom(
      this.emailTwoFactorTokenRecordGlobalState.state$,
    );

    return emailTwoFactorTokenRecord[email];
  }

  async clearTwoFactorToken(email: string): Promise<void> {
    await this.emailTwoFactorTokenRecordGlobalState.update((emailTwoFactorTokenRecord) => {
      emailTwoFactorTokenRecord[email] = null;
      return emailTwoFactorTokenRecord;
    });
  }

  async clearTokens(vaultTimeoutAction: VaultTimeoutAction, vaultTimeout: number): Promise<void> {
    await this.setTokens(null, null, vaultTimeoutAction, vaultTimeout, [null, null]);
  }

  // jwthelper methods
  // ref https://github.com/auth0/angular-jwt/blob/master/src/angularJwt/services/jwt.js

  async decodeAccessToken(token?: string): Promise<any> {
    token = token ?? (await this.getAccessToken());

    if (token == null) {
      throw new Error("Token not found.");
    }

    return TokenService.decodeAccessToken(token);
  }

  async getTokenExpirationDate(): Promise<Date> {
    const decoded = await this.decodeAccessToken();
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
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.sub === "undefined") {
      throw new Error("No user id found");
    }

    return decoded.sub as string;
  }

  async getEmail(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.email === "undefined") {
      throw new Error("No email found");
    }

    return decoded.email as string;
  }

  async getEmailVerified(): Promise<boolean> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.email_verified === "undefined") {
      throw new Error("No email verification found");
    }

    return decoded.email_verified as boolean;
  }

  async getName(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.name === "undefined") {
      return null;
    }

    return decoded.name as string;
  }

  async getIssuer(): Promise<string> {
    const decoded = await this.decodeAccessToken();
    if (typeof decoded.iss === "undefined") {
      throw new Error("No issuer found");
    }

    return decoded.iss as string;
  }

  async getIsExternal(): Promise<boolean> {
    const decoded = await this.decodeAccessToken();

    return Array.isArray(decoded.amr) && decoded.amr.includes("external");
  }

  private async determineStorageLocation(
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ): Promise<"disk" | "memory"> {
    if (vaultTimeoutAction === VaultTimeoutAction.LogOut && vaultTimeout != null) {
      return "memory";
    } else {
      return "disk";
    }
  }
}

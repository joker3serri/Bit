import { firstValueFrom } from "rxjs";

import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";
import { StorageLocation } from "../../platform/enums";
import { Utils } from "../../platform/misc/utils";
import { StorageOptions } from "../../platform/models/domain/storage-options";
import {
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
  SingleUserStateProvider,
} from "../../platform/state";
import { UserId } from "../../types/guid";
import { TokenService as TokenServiceAbstraction } from "../abstractions/token.service";

import {
  ACCESS_TOKEN_DISK,
  ACCESS_TOKEN_MEMORY,
  ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE,
  // API_KEY_CLIENT_ID_DISK,
  // API_KEY_CLIENT_ID_MEMORY,
  // API_KEY_CLIENT_SECRET_DISK,
  // API_KEY_CLIENT_SECRET_MEMORY,
  EMAIL_TWO_FACTOR_TOKEN_RECORD_DISK_LOCAL,
  // REFRESH_TOKEN_DISK,
  // REFRESH_TOKEN_MEMORY,
  // REFRESH_TOKEN_MIGRATED_TO_SECURE_STORAGE,
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

  private readonly accessTokenSecureStorageKey: string = "_accessToken";

  private readonly refreshTokenSecureStorageKey: string = "_refreshToken";

  private emailTwoFactorTokenRecordGlobalState: GlobalState<Record<string, string>>;

  constructor(
    // Note: we cannot use ActiveStateProvider because if we ever want to inject
    // this service into the AccountService, we will make a circular dependency
    private singleUserStateProvider: SingleUserStateProvider,
    private globalStateProvider: GlobalStateProvider,
    private platformUtilsService: PlatformUtilsService,
    private secureStorageService: AbstractStorageService,
  ) {
    this.initializeState();
  }

  private initializeState(): void {
    this.emailTwoFactorTokenRecordGlobalState = this.globalStateProvider.get(
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

  // TODO: update set logic to properly consider if user id exists and then use setToUser if it exists
  // TODO: only use secure storage if storing on disk
  // TODO: update rest of file to use singleUserStateProvider

  async setAccessToken(
    token: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
    userId: UserId,
  ): Promise<void> {
    // If we don't have a user id, we can't save the value
    if (!userId) {
      throw new Error("User id not found. Cannot save access token.");
    }

    // Platform doesn't support secure storage, so use state provider implementation
    const storageLocation = await this.determineStorageLocation(vaultTimeoutAction, vaultTimeout);

    if (storageLocation === "disk") {
      if (this.platformSupportsSecureStorage) {
        await this.secureStorageService.save<string>(
          `${userId}${this.accessTokenSecureStorageKey}`,
          token,
          this.getSecureStorageOptions(userId),
        );

        // TODO: PM-6408 - https://bitwarden.atlassian.net/browse/PM-6408
        // 2024-02-20: Remove access token from memory and disk so that we migrate to secure storage over time.
        // Remove these 2 calls to remove the access token from memory and disk after 3 releases.

        await this.singleUserStateProvider.get(userId, ACCESS_TOKEN_DISK).update((_) => null);
        await this.singleUserStateProvider.get(userId, ACCESS_TOKEN_MEMORY).update((_) => null);

        // Set flag to indicate that the access token has been migrated to secure storage (don't remove this)
        await this.setAccessTokenMigratedToSecureStorage(userId);

        return;
      }

      // Platform doesn't support secure storage, so use state provider implementation
      await this.singleUserStateProvider.get(userId, ACCESS_TOKEN_DISK).update((_) => token);
    } else if (storageLocation === "memory") {
      await this.singleUserStateProvider.get(userId, ACCESS_TOKEN_MEMORY).update((_) => token);
    }
  }

  async clearAccessTokenByUserId(userId: UserId): Promise<void> {
    // If we don't have a user id, we can't clear the value
    if (!userId) {
      throw new Error("User id not found. Cannot clear access token.");
    }

    if (this.platformSupportsSecureStorage) {
      await this.secureStorageService.remove(
        `${userId}${this.accessTokenSecureStorageKey}`,
        this.getSecureStorageOptions(userId),
      );
      return;
    }

    // Platform doesn't support secure storage, so use state provider implementation
    await this.singleUserStateProvider.get(userId, ACCESS_TOKEN_DISK).update((_) => null);
    await this.singleUserStateProvider.get(userId, ACCESS_TOKEN_MEMORY).update((_) => null);
  }

  async getAccessToken(userId: UserId): Promise<string | undefined> {
    if (!userId) {
      throw new Error("User id not found. Cannot get access token.");
    }

    const accessTokenMigratedToSecureStorage =
      await this.getAccessTokenMigratedToSecureStorage(userId);
    if (this.platformSupportsSecureStorage && accessTokenMigratedToSecureStorage) {
      return await this.getAccessTokenFromSecureStorage(userId);
    }

    // Try to get the access token from memory
    const accessTokenMemory = await this.getAccessTokenByUserIdAndLocation(
      userId,
      ACCESS_TOKEN_MEMORY,
    );

    if (accessTokenMemory != null) {
      return accessTokenMemory;
    }

    // If memory is null, read from disk
    return await this.getAccessTokenByUserIdAndLocation(userId, ACCESS_TOKEN_DISK);
  }

  private async getAccessTokenFromSecureStorage(userId: UserId): Promise<string | null> {
    // If we have a user ID, read from secure storage.
    return await this.secureStorageService.get<string>(
      `${userId}${this.accessTokenSecureStorageKey}`,
      this.getSecureStorageOptions(userId),
    );
  }
  private async getAccessTokenByUserIdAndLocation(
    userId: UserId,
    storageLocation: KeyDefinition<string>,
  ): Promise<string | undefined> {
    // read from single user state provider
    return await firstValueFrom(this.singleUserStateProvider.get(userId, storageLocation).state$);
  }

  private async getAccessTokenMigratedToSecureStorage(userId: UserId): Promise<boolean> {
    return await firstValueFrom(
      this.singleUserStateProvider.get(userId, ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE).state$,
    );
  }

  private async setAccessTokenMigratedToSecureStorage(userId: UserId): Promise<void> {
    await this.singleUserStateProvider
      .get(userId, ACCESS_TOKEN_MIGRATED_TO_SECURE_STORAGE)
      .update((_) => true);
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
        this.getSecureStorageOptions(userId),
      );

      // TODO: PM-6408 - https://bitwarden.atlassian.net/browse/PM-6408
      // 2024-02-20: Remove refresh token from memory and disk so that we migrate to secure storage over time.
      // Remove these 2 calls to remove the refresh token from memory and disk after 3 releases.
      await this.refreshTokenDiskState.update((_) => null);
      await this.refreshTokenMemoryState.update((_) => null);

      // Set flag to indicate that the refresh token has been migrated to secure storage (don't remove this)
      await this.setRefreshTokenMigratedToSecureStorage();

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
    const refreshTokenMigratedToSecureStorage = await this.getRefreshTokenMigratedToSecureStorage();
    if (this.platformSupportsSecureStorage && refreshTokenMigratedToSecureStorage) {
      return await this.getRefreshTokenFromSecureStorage();
    }

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

    return null;
  }

  private async getRefreshTokenFromSecureStorage(): Promise<string | null> {
    if (!this.platformSupportsSecureStorage) {
      return null;
    }

    const userId: UserId = await firstValueFrom(this.singleUserStateProvider.activeUserId$);

    // if we still don't have a user id, we can't read from secure storage
    if (!userId) {
      return null;
    }

    return await this.secureStorageService.get<string>(
      `${userId}${this.refreshTokenSecureStorageKey}`,
      this.getSecureStorageOptions(userId),
    );
  }

  private async getRefreshTokenMigratedToSecureStorage(): Promise<boolean> {
    return await firstValueFrom(this.refreshTokenMigratedToSecureStorageState.state$);
  }

  private async setRefreshTokenMigratedToSecureStorage(): Promise<void> {
    await this.refreshTokenMigratedToSecureStorageState.update((_) => true);
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

  // TODO: in the future, we should evaluate creating a custom type for the decoded token
  // we also could consider removing these methods that expose account information and
  // instead require users to go to the account service for this info (e.g. accountService.getEmail())

  // TODO: short term, we will need to have each consumer of these methods below
  // retrieve the access token and then call the method with the token as an argument

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

  private getSecureStorageOptions(userId: UserId): StorageOptions {
    return {
      storageLocation: StorageLocation.Disk,
      useSecureStorage: true,
      userId: userId,
    };
  }
}

import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { UserId } from "../../types/guid";

export abstract class TokenService {
  /**
   * Sets the access token, refresh token, API Key Client ID, and API Key Client Secret for the active user id
   * in memory or disk based on the given vaultTimeoutAction and vaultTimeout.
   * Note: for platforms that support secure storage, the access & refresh tokens are stored in secure storage.
   * Note 2: this method also enforces always setting the access token and the refresh token together as
   * we retrieve the user id required to set the refresh token in secure storage from the access token.
   * @param accessToken The access token to set.
   * @param refreshToken The refresh token to set.
   * @param clientIdClientSecret The API Key Client ID and Client Secret to set.
   * @param vaultTimeoutAction The action to take when the vault times out.
   * @param vaultTimeout The timeout for the vault.
   * @returns A promise that resolves when the tokens have been set.
   */
  setTokens: (
    accessToken: string,
    refreshToken: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
    clientIdClientSecret?: [string, string],
  ) => Promise<void>;

  /**
   * Sets the access token for the given user id in memory or disk based on the given vaultTimeoutAction and vaultTimeout.
   * Note: for platforms that support secure storage, the access & refresh tokens are stored in secure storage.
   * @param token The access token to set.
   * @param vaultTimeoutAction The action to take when the vault times out.
   * @param vaultTimeout The timeout for the vault.
   * @returns A promise that resolves when the access token has been set.
   */
  setAccessToken: (
    token: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<void>;

  // TODO: revisit this approach once the state service is fully deprecated.
  /**
   * Clears the access token for the given user id out of both memory and disk.
   * @param userId The user id to clear the access token for.
   * @returns A promise that resolves when the access token has been cleared.
   *
   * Note: This method is required so that the StateService doesn't have to inject the VaultTimeoutSettingsService to
   * pass in the vaultTimeoutAction and vaultTimeout.
   * This avoids a circular dependency between the StateService, TokenService, and VaultTimeoutSettingsService.
   */
  clearAccessTokenByUserId: (userId: UserId) => Promise<void>;

  /**
   * Gets the access token for the given, optional user id.
   * @param userId - The optional user id to get the access token for; if not provided, the active user is used.
   * @returns A promise that resolves with the access token for the given user id.
   */
  getAccessToken: (userId?: UserId) => Promise<string>;

  /**
   * Gets the refresh token for the active user.
   * @returns A promise that resolves with the refresh token.
   */
  getRefreshToken: () => Promise<string>;

  /**
   * Sets the API Key Client ID for the active user id in memory or disk based on the given vaultTimeoutAction and vaultTimeout.
   * @param clientId The API Key Client ID to set.
   * @param vaultTimeoutAction The action to take when the vault times out.
   * @param vaultTimeout The timeout for the vault.
   * @returns A promise that resolves when the API Key Client ID has been set.
   */
  setClientId: (
    clientId: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<void>;

  /**
   * Gets the API Key Client ID for the active user.
   * @returns A promise that resolves with the API Key Client ID.
   */
  getClientId: () => Promise<string>;
  /**
   * Sets the API Key Client Secret for the active user id in memory or disk based on the given vaultTimeoutAction and vaultTimeout.
   * @param clientSecret The API Key Client Secret to set.
   * @param vaultTimeoutAction The action to take when the vault times out.
   * @param vaultTimeout The timeout for the vault.
   * @returns A promise that resolves when the API Key Client Secret has been set.
   */
  setClientSecret: (
    clientSecret: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<void>;
  /**
   * Gets the API Key Client Secret for the active user.
   * @returns A promise that resolves with the API Key Client Secret.
   */
  getClientSecret: () => Promise<string>;

  setTwoFactorToken: (email: string, twoFactorToken: string) => Promise<void>;
  getTwoFactorToken: (email: string) => Promise<string>;
  clearTwoFactorToken: (email: string) => Promise<void>;
  clearTokens: (vaultTimeoutAction: VaultTimeoutAction, vaultTimeout: number) => Promise<void>;
  decodeAccessToken: (token?: string) => Promise<any>;
  getTokenExpirationDate: () => Promise<Date>;
  tokenSecondsRemaining: (offsetSeconds?: number) => Promise<number>;
  tokenNeedsRefresh: (minutes?: number) => Promise<boolean>;
  getUserId: () => Promise<string>;
  getEmail: () => Promise<string>;
  getEmailVerified: () => Promise<boolean>;
  getName: () => Promise<string>;
  getIssuer: () => Promise<string>;
  getIsExternal: () => Promise<boolean>;
}

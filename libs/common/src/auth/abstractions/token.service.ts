import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

export abstract class TokenService {
  setTokens: (
    accessToken: string,
    refreshToken: string,
    clientIdClientSecret: [string, string],
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<any>;
  setToken: (
    token: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<any>;
  getToken: () => Promise<string>;
  getAccessTokenByUserId: (userId: string) => Promise<string>;
  setRefreshToken: (
    refreshToken: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<any>;
  getRefreshToken: () => Promise<string>;
  setClientId: (
    clientId: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<any>;
  getClientId: () => Promise<string>;
  setClientSecret: (
    clientSecret: string,
    vaultTimeoutAction: VaultTimeoutAction,
    vaultTimeout: number,
  ) => Promise<any>;
  getClientSecret: () => Promise<string>;
  setTwoFactorToken: (tokenResponse: IdentityTokenResponse) => Promise<any>;
  getTwoFactorToken: () => Promise<string>;
  clearTwoFactorToken: () => Promise<any>;
  clearToken: (vaultTimeoutAction: VaultTimeoutAction, vaultTimeout: number) => Promise<void>;
  decodeToken: (token?: string) => Promise<any>;
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

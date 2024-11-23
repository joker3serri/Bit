import { ClientType } from "@bitwarden/common/enums";

export type SsoClientType = ClientType.Web | ClientType.Browser | ClientType.Desktop;

/**
 * Abstract class for SSO component services.
 */
export abstract class SsoComponentService {
  /**
   * The client ID for the SSO component service. Either "browser", "extension", or "desktop".
   */
  clientId: SsoClientType;

  /**
   * Sets the cookies for the SSO component service.
   */
  setDocumentCookies?(): void;

  /**
   * Submits the SSO request and handles the response
   */
  abstract submitSso(
    identifier: string,
    returnUri?: string,
    includeUserIdentifier?: boolean,
  ): Promise<void>;

  /**
   * Builds the authorize URL for SSO
   */
  abstract buildAuthorizeUrl(
    identifier: string,
    returnUri?: string,
    includeUserIdentifier?: boolean,
    token?: string,
    redirectUri?: string,
    state?: string,
    codeChallenge?: string,
  ): Promise<string>;

  /**
   * Navigation callbacks
   */
  onSuccessfulLoginNavigate?(): Promise<void>;
  onSuccessfulLoginTwoFactorNavigate?(): Promise<void>;
  onSuccessfulLoginChangePasswordNavigate?(): Promise<void>;
  onSuccessfulLoginForceResetNavigate?(): Promise<void>;
  onSuccessfulLoginTdeNavigate?(): Promise<void>;
  onSuccessfulLogin?(): Promise<void>;
  onSuccessfulLoginTde?(): Promise<void>;
}

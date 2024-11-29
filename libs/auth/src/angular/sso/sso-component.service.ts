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
   * The redirect URI for the SSO component service.
   */
  redirectUri: string;

  /**
   * Sets the cookies for the SSO component service.
   */
  setDocumentCookies?(): void;

  /**
   * Navigation callbacks
   */
  onSuccessfulLoginForceResetNavigate?(): Promise<void>;
  onSuccessfulLoginTdeNavigate?(): Promise<void>;
  onSuccessfulLogin?(): Promise<void>;
  onSuccessfulLoginTde?(): Promise<void>;
}

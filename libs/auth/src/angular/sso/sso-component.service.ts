export enum SsoClientId {
  Web = "web",
  Browser = "browser",
  Desktop = "desktop",
}

/**
 * Abstract class for SSO component services.
 */
export abstract class SsoComponentService {
  /**
   * The client ID for the SSO component service. Either "browser", "extension", or "desktop".
   */
  clientId: SsoClientId;

  /**
   * Sets the cookies for the SSO component service.
   */
  setDocumentCookies?(): void;

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

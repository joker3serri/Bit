import { ClientType } from "@bitwarden/common/enums";

export type SsoClientType = ClientType.Web | ClientType.Browser | ClientType.Desktop;

/**
 * Abstract class for SSO component services.
 */
export abstract class SsoComponentService {
  /**
   * Sets the cookies for the SSO component service.
   */
  setDocumentCookies?(): void;

  /**
   * Closes the window.
   */
  closeWindow?(): Promise<void>;
}

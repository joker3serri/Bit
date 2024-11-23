import { SsoComponentService, SsoClientType } from "./sso-component.service";

export class DefaultSsoComponentService implements SsoComponentService {
  clientId: SsoClientType;

  /**
   * Default no-op implementation as extension and desktop don't need to set cookies.
   */
  setDocumentCookies(): void {}
}

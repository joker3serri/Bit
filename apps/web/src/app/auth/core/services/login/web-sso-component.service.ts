import { Injectable } from "@angular/core";

import {
  DefaultSsoComponentService,
  SsoClientId,
  SsoComponentService,
} from "@bitwarden/auth/angular";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

/**
 * This service is used to handle the SSO login process for the web client.
 */
@Injectable()
export class WebSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: SsoClientId;

  constructor(private i18nService: I18nService) {
    super();
    this.clientId = SsoClientId.Web;
  }

  setDocumentCookies(): void {
    document.cookie = `ssoHandOffMessage=${this.i18nService.t("ssoHandOff")};SameSite=strict`;
  }
}

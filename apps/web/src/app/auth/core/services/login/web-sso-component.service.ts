import { Injectable } from "@angular/core";

import { DefaultSsoComponentService, SsoComponentService } from "@bitwarden/auth/angular";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

@Injectable()
export class WebSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: string;

  constructor(private i18nService: I18nService) {
    super();
    this.clientId = "web";
  }

  setDocumentCookies(): void {
    document.cookie = `ssoHandOffMessage=${this.i18nService.t("ssoHandOff")};SameSite=strict`;
  }
}

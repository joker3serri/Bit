import { Injectable } from "@angular/core";

import { DefaultSsoComponentService, SsoComponentService } from "@bitwarden/auth/angular";

/**
 * This service is used to handle the SSO login process for the desktop client.
 */
@Injectable()
export class DesktopSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  constructor() {
    super();
  }
}

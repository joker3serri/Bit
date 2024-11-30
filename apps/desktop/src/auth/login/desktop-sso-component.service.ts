import { Injectable } from "@angular/core";

import {
  DefaultSsoComponentService,
  SsoClientType,
  SsoComponentService,
} from "@bitwarden/auth/angular";
import { ClientType } from "@bitwarden/common/enums";

/**
 * This service is used to handle the SSO login process for the desktop client.
 */
@Injectable()
export class DesktopSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  /**
   * The client ID for the SSO component service. Either "browser", "extension", or "desktop".
   */
  clientId: SsoClientType;

  /**
   * The redirect URI for the SSO component service.
   */
  redirectUri: string;

  constructor() {
    super();
    this.clientId = ClientType.Desktop;
  }
}

import { Injectable } from "@angular/core";

import {
  DefaultSsoComponentService,
  SsoClientType,
  SsoComponentService,
} from "@bitwarden/auth/angular";
import { ClientType } from "@bitwarden/common/enums";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

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
  onSuccessfulLoginTde: () => Promise<void>;

  constructor(
    private syncService: SyncService,
    private logService: LogService,
  ) {
    super();
    this.clientId = ClientType.Desktop;

    this.onSuccessfulLoginTde = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after TDE SSO login:", error);
      }
    };
  }
}

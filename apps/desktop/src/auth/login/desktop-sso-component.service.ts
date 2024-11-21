import { Injectable } from "@angular/core";

import {
  DefaultSsoComponentService,
  SsoClientId,
  SsoComponentService,
} from "@bitwarden/auth/angular";
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
  clientId: SsoClientId;
  redirectUri: string;
  onSuccessfulLogin: () => Promise<void>;
  onSuccessfulLoginTde: () => Promise<void>;

  constructor(
    private syncService: SyncService,
    private logService: LogService,
  ) {
    super();
    this.clientId = SsoClientId.Desktop;
    this.redirectUri = "bitwarden://sso-callback";

    this.onSuccessfulLogin = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after SSO login:", error);
      }
    };

    this.onSuccessfulLoginTde = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after TDE SSO login:", error);
      }
    };
  }
}

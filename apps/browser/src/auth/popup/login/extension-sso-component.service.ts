import { Injectable } from "@angular/core";

import {
  DefaultSsoComponentService,
  SsoClientType,
  SsoComponentService,
} from "@bitwarden/auth/angular";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { ClientType } from "@bitwarden/common/enums";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

/**
 * This service is used to handle the SSO login process for the browser extension.
 */
@Injectable()
export class ExtensionSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: SsoClientType;

  constructor(
    protected syncService: SyncService,
    protected authService: AuthService,
    protected environmentService: EnvironmentService,
    private window: Window,
    protected i18nService: I18nService,
    protected logService: LogService,
  ) {
    super();
    this.clientId = ClientType.Browser;

    /**
     * Closes the popup window after a successful login.
     */
    this.closeWindow = async (): Promise<void> => {
      this.window.close();
    };
  }
}

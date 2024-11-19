import { Injectable } from "@angular/core";

import { DefaultSsoComponentService, SsoComponentService } from "@bitwarden/auth/angular";

@Injectable()
export class DesktopSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: string;

  constructor() {
    super();
    this.clientId = "desktop";
  }
}

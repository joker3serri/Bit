import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { CipherId } from "@bitwarden/common/types/guid";
import { ViewPasswordHistoryService } from "@bitwarden/common/vault/abstractions/view-password-history.service";

/**
 * This class handles the premium upgrade process for the browser extension.
 */
export class BrowserViewPasswordHistoryService implements ViewPasswordHistoryService<CipherId> {
  private router = inject(Router);

  /**
   * Navigates to the password history screen.
   */
  async viewPasswordHistory(cipherId: string) {
    await this.router.navigate(["/cipher-password-history"], { queryParams: { cipherId } });
  }
}

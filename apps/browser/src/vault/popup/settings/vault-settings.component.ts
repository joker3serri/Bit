import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

import { BrowserApi } from "../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";

@Component({
  selector: "vault-settings",
  templateUrl: "vault-settings.component.html",
})
export class VaultSettingsComponent {
  constructor(
    public messagingService: MessagingService,
    private router: Router,
  ) {}

  async import() {
    await this.router.navigate(["/import"]);
    if (await BrowserApi.isPopupOpen()) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserPopupUtils.openCurrentPagePopout(window);
    }
  }
}

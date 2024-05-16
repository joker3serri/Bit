import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { ItemModule } from "@bitwarden/components";

import { BrowserApi } from "../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";
import { PopOutComponent } from "../../../platform/popup/components/pop-out.component";
import { PopupFooterComponent } from "../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../platform/popup/layout/popup-page.component";

@Component({
  templateUrl: "vault-settings-v2.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    RouterModule,
    PopupPageComponent,
    PopupFooterComponent,
    PopupHeaderComponent,
    PopOutComponent,
    ItemModule,
  ],
})
export class VaultSettingsV2Component {
  constructor(
    public messagingService: MessagingService,
    private router: Router,
  ) {}

  async import() {
    await this.router.navigate(["/import"]);
    if (await BrowserApi.isPopupOpen()) {
      await BrowserPopupUtils.openCurrentPagePopout(window);
    }
  }
}

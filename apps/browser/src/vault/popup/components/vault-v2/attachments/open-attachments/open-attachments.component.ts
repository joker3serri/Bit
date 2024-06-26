import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions";
import { BadgeModule, CardComponent, ItemModule, TypographyModule } from "@bitwarden/components";

import BrowserPopupUtils from "../../../../../../platform/popup/browser-popup-utils";

@Component({
  standalone: true,
  selector: "app-open-attachments",
  templateUrl: "./open-attachments.component.html",
  imports: [BadgeModule, CommonModule, ItemModule, JslibModule, TypographyModule, CardComponent],
})
export class OpenAttachmentsComponent {
  /** Cipher `id` */
  @Input({ required: true }) cipherId: string;

  /** True when the attachments window should be opened in a popout */
  openAttachmentsInPopout = BrowserPopupUtils.inPopup(window);

  /** True when the user has access to premium or h  */
  canAccessAttachments: boolean;

  constructor(
    private router: Router,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
  ) {
    this.billingAccountProfileStateService.hasPremiumFromAnySource$
      .pipe(takeUntilDestroyed())
      .subscribe((canAccessPremium) => {
        this.canAccessAttachments = canAccessPremium;
      });
  }

  /** Routes the user to the attachments screen, if available */
  async openAttachments() {
    if (!this.canAccessAttachments) {
      await this.router.navigate(["/premium"]);
      return;
    }

    if (this.openAttachmentsInPopout) {
      const destinationUrl = this.router
        .createUrlTree(["/attachments"], { queryParams: { cipherId: this.cipherId } })
        .toString();

      const currentBaseUrl = window.location.href.replace(this.router.url, "");

      await BrowserPopupUtils.openCurrentPagePopout(window, currentBaseUrl + destinationUrl);
    } else {
      await this.router.navigate(["/attachments"], { queryParams: { cipherId: this.cipherId } });
    }
  }
}

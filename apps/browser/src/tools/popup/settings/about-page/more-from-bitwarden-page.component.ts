import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { DialogService } from "@bitwarden/components";

import { BrowserApi } from "../../../../platform/browser/browser-api";
import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";

@Component({
  templateUrl: "more-from-bitwarden-page.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, RouterModule, PopOutComponent],
})
export class MoreFromBitwardenPageComponent {
  canAccessPremium$: Observable<boolean>;

  constructor(
    private dialogService: DialogService,
    billingAccountProfileStateService: BillingAccountProfileStateService,
  ) {
    this.canAccessPremium$ = billingAccountProfileStateService.hasPremiumFromAnySource$;
  }

  async openBitwardenForBusinessPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "bitwardenForBusinessPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/business/");
    }
  }

  async openAuthenticatorPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToAuthenticatorPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/authenticator");
    }
  }

  async openSecretsManagerPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToSecretsManagerPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/secrets-manager");
    }
  }

  async openPasswordlessDotDevPage() {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "continueToBitwardenDotCom" },
      content: { key: "continueToPasswordlessDotDevPageDesc" },
      type: "info",
      acceptButtonText: { key: "continue" },
    });
    if (confirmed) {
      await BrowserApi.createNewTab("https://bitwarden.com/products/passwordless");
    }
  }
}

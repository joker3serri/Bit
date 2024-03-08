import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  templateUrl: "subscription.component.html",
})
export class SubscriptionComponent implements OnInit {
  hasPremium$: Observable<boolean>;
  selfHosted: boolean;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {
    this.hasPremium$ = billingAccountProfileStateService.hasPremiumPersonally$;
  }

  ngOnInit() {
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }
}

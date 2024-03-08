import { Directive, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { BillingAccountProfileStateServiceAbstraction } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service.abstraction";

/**
 * Hides the element if the user has premium.
 */
@Directive({
  selector: "[appNotPremium]",
})
export class NotPremiumDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private billingAccountProfileStateService: BillingAccountProfileStateServiceAbstraction,
  ) {}

  async ngOnInit(): Promise<void> {
    const premium = await firstValueFrom(this.billingAccountProfileStateService.canAccessPremium$);

    if (premium) {
      this.viewContainer.clear();
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}

import { Component } from "@angular/core";
import { map, Observable } from "rxjs";

import { PaymentMethodWarningServiceAbstraction as PaymentMethodWarningService } from "@bitwarden/common/billing/abstractions/payment-method-warning-service.abstraction";

type PaymentMethodBanner = {
  organizationId: string;
  organizationName: string;
  visible: boolean;
};

@Component({
  selector: "app-payment-method-warnings",
  templateUrl: "payment-method-warnings.component.html",
})
export class PaymentMethodWarningsComponent {
  constructor(private paymentMethodWarningService: PaymentMethodWarningService) {}

  protected banners$: Observable<PaymentMethodBanner[]> =
    this.paymentMethodWarningService.paymentMethodWarnings$.pipe(
      map((warnings) =>
        Object.entries(warnings).map(([organizationId, warning]) => ({
          organizationId,
          organizationName: warning.organizationName,
          visible: warning.risksSubscriptionFailure && !warning.acknowledged,
        })),
      ),
    );

  protected async closeBanner(organizationId: string): Promise<void> {
    await this.paymentMethodWarningService.acknowledge(organizationId);
  }
}

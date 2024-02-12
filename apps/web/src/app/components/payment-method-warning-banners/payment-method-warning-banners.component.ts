import { Component } from "@angular/core";
import { map, Observable } from "rxjs";

import { PaymentMethodWarningServiceAbstraction as PaymentMethodWarningService } from "@bitwarden/common/billing/abstractions/payment-method-warning-service.abstraction";
import { BannerModule } from "@bitwarden/components";

import { SharedModule } from "../../shared/shared.module";

type PaymentMethodBanner = {
  organizationId: string;
  organizationName: string;
  visible: boolean;
};

@Component({
  standalone: true,
  selector: "app-payment-method-warning-banners",
  templateUrl: "payment-method-warning-banners.component.html",
  imports: [BannerModule, SharedModule],
})
export class PaymentMethodWarningBannersComponent {
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

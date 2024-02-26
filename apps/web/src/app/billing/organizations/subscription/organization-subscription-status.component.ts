import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Subscription } from "@bitwarden/common/billing/models/domain/subscription";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { SharedModule } from "../../../shared";

@Component({
  selector: "app-organization-subscription-status",
  templateUrl: "organization-subscription-status.component.html",
  standalone: true,
  imports: [SharedModule],
})
export class OrganizationSubscriptionStatusComponent {
  @Input({ required: true }) subscription: Subscription;
  @Input({ required: true }) plan: string;
  @Output() reinstatementRequested = new EventEmitter<void>();

  constructor(private i18nService: I18nService) {}

  get expirationIndicator(): { label: string; date: Date; danger: boolean } {
    switch (this.subscription.status) {
      case "active": {
        return {
          label: this.i18nService.t("subscriptionExpiration"),
          date: this.subscription.currentPeriod.end,
          danger: false,
        };
      }
      case "trialing": {
        return {
          label: this.i18nService.t("trialingUntil"),
          date: this.subscription.currentPeriod.end,
          danger: false,
        };
      }
      case "past_due":
      case "unpaid": {
        return {
          label: this.i18nService.t("suspensionDate"),
          date: this.subscription.warnings.suspensionDate,
          danger: true,
        };
      }
      case "incomplete_expired":
      case "canceled": {
        return {
          label: this.i18nService.t("cancellationDate"),
          date: this.subscription.cancellation.canceledAt,
          danger: true,
        };
      }
    }
  }

  get labelForStatus(): string {
    const sponsored = this.subscription.items.some((item) => item.sponsored);
    return sponsored
      ? this.i18nService.t("sponsored")
      : this.subscription.status.replace(/_/g, " ");
  }

  get subscriptionIsCanceled(): boolean {
    return this.subscription.status === "canceled";
  }

  get subscriptionIsPastDue(): boolean {
    return this.subscription.status === "past_due";
  }

  get subscriptionIsUnpaid(): boolean {
    return this.subscription.status === "unpaid";
  }

  get subscriptionIsPendingCancellation(): boolean {
    return !this.subscriptionIsCanceled && !!this.subscription.cancellation.cancelAt;
  }

  requestReinstatement = () => this.reinstatementRequested.emit();
}

import { Component, EventEmitter, Input, Output } from "@angular/core";

import { OrganizationSubscriptionResponse } from "@bitwarden/common/billing/models/response/organization-subscription.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

@Component({
  selector: "app-subscription-status",
  templateUrl: "subscription-status.component.html",
})
export class SubscriptionStatusComponent {
  @Input({ required: true }) organizationSubscriptionResponse: OrganizationSubscriptionResponse;
  @Output() reinstatementRequested = new EventEmitter<void>();

  constructor(private i18nService: I18nService) {}

  get subscription() {
    return this.organizationSubscriptionResponse.subscription;
  }

  get expirationIndicator(): { label: string; date: string; danger: boolean } {
    switch (this.subscription.status) {
      case "active": {
        return {
          label: this.i18nService.t("subscriptionExpiration"),
          date: this.subscription.periodEndDate,
          danger: false,
        };
      }
      case "trialing": {
        return {
          label: this.i18nService.t("trialingUntil"),
          date: this.subscription.periodEndDate,
          danger: false,
        };
      }
      case "past_due":
      case "unpaid": {
        return {
          label: this.i18nService.t("suspensionDate"),
          date: this.subscription.suspensionDate,
          danger: true,
        };
      }
      case "incomplete_expired":
      case "canceled": {
        return {
          label: this.i18nService.t("cancellationDate"),
          date: this.subscription.cancelledDate,
          danger: true,
        };
      }
    }
  }

  get labelForStatus(): string {
    const sponsored = this.subscription.items.some((item) => item.sponsoredSubscriptionItem);
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
    return !this.subscriptionIsCanceled && this.subscription.cancelAtEndDate;
  }

  requestReinstatement = () => this.reinstatementRequested.emit();
}

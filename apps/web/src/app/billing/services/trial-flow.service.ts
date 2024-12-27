// FIXME: Update this file to be type safe and remove this and next line
// @ts-strict-ignore
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { lastValueFrom } from "rxjs";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billing-api.service.abstraction";
import { BillingSourceResponse } from "@bitwarden/common/billing/models/response/billing.response";
import { OrganizationBillingMetadataResponse } from "@bitwarden/common/billing/models/response/organization-billing-metadata.response";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/billing/models/response/organization-subscription.response";
import { PaymentSourceResponse } from "@bitwarden/common/billing/models/response/payment-source.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService } from "@bitwarden/components";

import { FreeTrial } from "../../core/types/free-trial";
import {
  ChangePlanDialogResultType,
  openChangePlanDialog,
} from "../organizations/change-plan-dialog.component";

@Injectable({ providedIn: "root" })
export class TrialFlowService {
  constructor(
    private i18nService: I18nService,
    protected dialogService: DialogService,
    private router: Router,
    protected billingApiService: BillingApiServiceAbstraction,
    private organizationApiService: OrganizationApiServiceAbstraction,
  ) {}
  checkForOrgsWithUpcomingPaymentIssues(
    organization: Organization,
    organizationSubscription: OrganizationSubscriptionResponse,
    paymentSource: BillingSourceResponse | PaymentSourceResponse,
  ): FreeTrial {
    const trialEndDate = organizationSubscription.subscription?.trialEndDate;
    const displayBanner =
      !paymentSource &&
      organization.isOwner &&
      organizationSubscription?.subscription.status === "trialing";
    const trialRemainingDays = trialEndDate ? this.calculateTrialRemainingDays(trialEndDate) : 0;
    const freeTrialMessage = this.getFreeTrialMessage(trialRemainingDays);

    return {
      remainingDays: trialRemainingDays,
      message: freeTrialMessage,
      shownBanner: displayBanner,
      organizationId: organization.id,
      organizationName: organization.name,
    };
  }

  calculateTrialRemainingDays(trialEndDate: string): number | undefined {
    const today = new Date();
    const trialEnd = new Date(trialEndDate);
    const timeDifference = trialEnd.getTime() - today.getTime();

    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }

  getFreeTrialMessage(trialRemainingDays: number): string {
    if (trialRemainingDays >= 2) {
      return this.i18nService.t("freeTrialEndPromptCount", trialRemainingDays);
    } else if (trialRemainingDays === 1) {
      return this.i18nService.t("freeTrialEndPromptTomorrowNoOrgName");
    } else {
      return this.i18nService.t("freeTrialEndingTodayWithoutOrgName");
    }
  }

  async handleUnpaidSubscriptionDialog(
    org: Organization,
    billingMetadata: OrganizationBillingMetadataResponse,
  ): Promise<void> {
    if (billingMetadata.isSubscriptionUnpaid || billingMetadata.isSubscriptionCanceled) {
      const confirmed = await this.promptForPaymentNavigation(
        org,
        billingMetadata.isSubscriptionCanceled,
        billingMetadata.isSubscriptionUnpaid,
      );
      if (confirmed) {
        await this.navigateToPaymentMethod(org.id);
      }
    }
  }

  private async promptForPaymentNavigation(
    org: Organization,
    isCanceled: boolean,
    isUnpaid: boolean,
  ): Promise<boolean> {
    if (!org.isOwner && !org.isProviderUser) {
      await this.dialogService.openSimpleDialog({
        title: this.i18nService.t("suspendedOrganizationTitle", org.name),
        content: { key: "suspendedUserOrgMessage" },
        type: "danger",
        acceptButtonText: this.i18nService.t("close"),
        cancelButtonText: null,
      });
      return false;
    }
    if (org.hasProvider) {
      await this.dialogService.openSimpleDialog({
        title: this.i18nService.t("suspendedOrganizationTitle", org.name),
        content: { key: "suspendedManagedOrgMessage", placeholders: [org.providerName] },
        type: "danger",
        acceptButtonText: this.i18nService.t("close"),
        cancelButtonText: null,
      });
      return false;
    }

    if (org.isOwner && isUnpaid) {
      return await this.dialogService.openSimpleDialog({
        title: this.i18nService.t("suspendedOrganizationTitle", org.name),
        content: { key: "suspendedOwnerOrgMessage" },
        type: "danger",
        acceptButtonText: this.i18nService.t("continue"),
        cancelButtonText: this.i18nService.t("close"),
      });
    }
    if (org.isOwner && isCanceled) {
      await this.changePlan(org);
    }
  }

  private async navigateToPaymentMethod(orgId: string) {
    await this.router.navigate(["organizations", `${orgId}`, "billing", "payment-method"], {
      state: { launchPaymentModalAutomatically: true },
    });
  }

  private async changePlan(org: Organization) {
    const subscription = await this.organizationApiService.getSubscription(org.id);
    const reference = openChangePlanDialog(this.dialogService, {
      data: {
        organizationId: org.id,
        subscription: subscription,
        productTierType: org.productTierType,
      },
    });

    const result = await lastValueFrom(reference.closed);

    if (result === ChangePlanDialogResultType.Closed) {
      return;
    }
  }
}

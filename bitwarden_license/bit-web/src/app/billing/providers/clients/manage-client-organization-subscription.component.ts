import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { ProviderOrganizationOrganizationDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-organization.response";
import { BillingApiServiceAbstraction as BillingApiService } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { ProviderSubscriptionUpdateRequest } from "@bitwarden/common/billing/models/request/provider-subscription-update.request";
import { Plans } from "@bitwarden/common/billing/models/response/provider-subscription-response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

type ManageClientOrganizationDialogParams = {
  organization: ProviderOrganizationOrganizationDetailsResponse;
};

@Component({
  templateUrl: "manage-client-organization-subscription.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class ManageClientOrganizationSubscriptionComponent implements OnInit {
  loading = true;
  providerOrganizationId: string;
  providerId: string;

  clientName: string;
  assignedSeats: number;
  unassignedSeats: number;
  planName: string;
  AdditionalSeatPurchased: number;
  remainingOpenSeats: number;

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) protected data: ManageClientOrganizationDialogParams,
    private billingApiService: BillingApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
  ) {
    this.providerOrganizationId = data.organization.id;
    this.providerId = data.organization.providerId;
    this.clientName = data.organization.organizationName;
    this.assignedSeats = data.organization.seats;
    this.unassignedSeats = data.organization.seats - data.organization.userCount;
    this.planName = data.organization.plan;
  }

  async ngOnInit() {
    try {
      const response = await this.billingApiService.getProviderClientSubscriptions(this.providerId);
      this.AdditionalSeatPurchased = this.getPurchasedSeatsByPlan(this.planName, response.plans);
      const seatMinimum = this.getProviderSeatMinimumByPlan(this.planName, response.plans);
      const assignedByPlan = this.getAssignedByPlan(this.planName, response.plans);
      this.remainingOpenSeats = seatMinimum - assignedByPlan;
    } catch (error) {
      this.remainingOpenSeats = 0;
      this.AdditionalSeatPurchased = 0;
    }
    this.loading = false;
  }

  async updateSubscription(assignedSeats: number) {
    if (!assignedSeats) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("assignedSeatCannotUpdate"),
      );
      return;
    }
    try {
      const request = new ProviderSubscriptionUpdateRequest();
      request.assignedSeats = assignedSeats;

      await this.billingApiService.putProviderClientSubscriptions(
        this.providerId,
        this.providerOrganizationId,
        request,
      );
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("subscriptionUpdated"),
      );
    } catch (ex) {
      if (ex.statusCode === 204) {
        this.platformUtilsService.showToast(
          "success",
          null,
          this.i18nService.t("subscriptionUpdated"),
        );
      } else {
        this.platformUtilsService.showToast(
          "success",
          null,
          this.i18nService.t("assignedSeatCannotUpdate"),
        );
      }
    }

    this.dialogRef.close();
  }

  getPurchasedSeatsByPlan(planName: string, plans: Plans[]): number {
    const plan = plans.find((plan) => plan.planName === planName);
    if (plan) {
      return plan.purchasedSeats;
    } else {
      return 0;
    }
  }

  getAssignedByPlan(planName: string, plans: Plans[]): number {
    const plan = plans.find((plan) => plan.planName === planName);
    if (plan) {
      return plan.assignedSeats;
    } else {
      return 0;
    }
  }

  getProviderSeatMinimumByPlan(planName: string, plans: Plans[]) {
    const plan = plans.find((plan) => plan.planName === planName);
    if (plan) {
      return plan.seatMinimum;
    } else {
      return 0;
    }
  }

  static open(dialogService: DialogService, data: ManageClientOrganizationDialogParams) {
    return dialogService.open(ManageClientOrganizationSubscriptionComponent, { data });
  }
}

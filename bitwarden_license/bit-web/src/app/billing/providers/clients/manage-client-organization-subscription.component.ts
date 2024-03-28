import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { ProviderOrganizationOrganizationDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-organization.response";
import { BillingApiServiceAbstraction as BillingApiService } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { ProviderSubscriptionUpdateRequest } from "@bitwarden/common/billing/models/request/provider-subscription-update.request";
import { ProviderPlansResponse } from "@bitwarden/common/billing/models/response/provider-plans.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
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
  organizationId: string;
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
  ) {
    this.organizationId = data.organization.organizationId;
    this.providerId = data.organization.providerId;
    this.clientName = data.organization.organizationName;
    this.assignedSeats = data.organization.seats;
    this.unassignedSeats = data.organization.seats - data.organization.userCount;
    this.planName = data.organization.plan;
  }

  async ngOnInit() {
    try {
      const response = await this.billingApiService.getProviderClientSubscriptions(this.providerId);
      this.AdditionalSeatPurchased = this.getPurchasedSeatsByPlan(
        this.planName,
        response.providerPlans,
      );
      const seatMinimum = this.getProviderSeatMinimumByPlan(this.planName, response.providerPlans);
      this.remainingOpenSeats = seatMinimum - this.assignedSeats;
    } catch (error) {
      this.AdditionalSeatPurchased = 0;
      this.remainingOpenSeats = 0;
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

    const request = new ProviderSubscriptionUpdateRequest();
    request.assignedSeats = assignedSeats;

    //await this.billingApiService.putProviderClientSubscriptions(this.providerId,this.organizationId,request);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("subscriptionUpdated"));

    this.dialogRef.close();
  }

  getPurchasedSeatsByPlan(planName: string, plans: ProviderPlansResponse[]): number {
    const plan = plans.find((plan) => plan.planName === planName);
    if (plan) {
      return plan.purchasedSeats;
    } else {
      return 0;
    }
  }

  getProviderSeatMinimumByPlan(planName: string, plans: ProviderPlansResponse[]) {
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

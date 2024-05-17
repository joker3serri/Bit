import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { UpdateProviderPaymentInformationRequest } from "@bitwarden/common/billing/models/request/update-provider-payment-information.request";
import { OrganizationBillingMetadataResponse } from "@bitwarden/common/billing/models/response/organization-billing-metadata.response";

import { ApiService } from "../../abstractions/api.service";
import { BillingApiServiceAbstraction } from "../../billing/abstractions/billilng-api.service.abstraction";
import { SubscriptionCancellationRequest } from "../../billing/models/request/subscription-cancellation.request";
import { OrganizationBillingStatusResponse } from "../../billing/models/response/organization-billing-status.response";
import { OrganizationSubscriptionResponse } from "../../billing/models/response/organization-subscription.response";
import { PlanResponse } from "../../billing/models/response/plan.response";
import { ListResponse } from "../../models/response/list.response";
import { CreateClientOrganizationRequest } from "../models/request/create-client-organization.request";
import { UpdateClientOrganizationRequest } from "../models/request/update-client-organization.request";
import { ProviderSubscriptionResponse } from "../models/response/provider-subscription-response";

export class BillingApiService implements BillingApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  cancelOrganizationSubscription(
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ): Promise<void> {
    return this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/cancel",
      request,
      true,
      false,
    );
  }

  cancelPremiumUserSubscription(request: SubscriptionCancellationRequest): Promise<void> {
    return this.apiService.send("POST", "/accounts/cancel", request, true, false);
  }

  createClientOrganization(
    providerId: string,
    request: CreateClientOrganizationRequest,
  ): Promise<void> {
    return this.apiService.send(
      "POST",
      "/providers/" + providerId + "/clients",
      request,
      true,
      false,
    );
  }

  async createSetupIntentForProvider(providerId: string, type: PaymentMethodType) {
    let path = "/providers/" + providerId + "/billing/setup-intent/";
    switch (type) {
      case PaymentMethodType.BankAccount: {
        path += "bank-account";
        break;
      }
      case PaymentMethodType.Card: {
        path += "card";
        break;
      }
    }
    const r = await this.apiService.send("POST", path, null, true, true);
    return r as string;
  }

  async getBillingStatus(id: string): Promise<OrganizationBillingStatusResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + id + "/billing-status",
      null,
      true,
      true,
    );
    return new OrganizationBillingStatusResponse(r);
  }

  async getOrganizationBillingMetadata(
    organizationId: string,
  ): Promise<OrganizationBillingMetadataResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/billing/metadata",
      null,
      true,
      true,
    );

    return new OrganizationBillingMetadataResponse(r);
  }

  async getOrganizationSubscription(
    organizationId: string,
  ): Promise<OrganizationSubscriptionResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/subscription",
      null,
      true,
      true,
    );
    return new OrganizationSubscriptionResponse(r);
  }

  async getPlans(): Promise<ListResponse<PlanResponse>> {
    const r = await this.apiService.send("GET", "/plans", null, false, true);
    return new ListResponse(r, PlanResponse);
  }

  async getProviderSubscription(providerId: string): Promise<ProviderSubscriptionResponse> {
    const r = await this.apiService.send(
      "GET",
      "/providers/" + providerId + "/billing/subscription",
      null,
      true,
      true,
    );
    return new ProviderSubscriptionResponse(r);
  }

  async updateClientOrganization(
    providerId: string,
    organizationId: string,
    request: UpdateClientOrganizationRequest,
  ): Promise<any> {
    return await this.apiService.send(
      "PUT",
      "/providers/" + providerId + "/clients/" + organizationId,
      request,
      true,
      false,
    );
  }

  async updateProviderPaymentInformation(
    providerId: string,
    request: UpdateProviderPaymentInformationRequest,
  ): Promise<void> {
    return await this.apiService.send(
      "PUT",
      "/providers/" + providerId + "/billing/payment-information",
      request,
      true,
      false,
    );
  }

  async verifyProviderMicroDeposit(providerId: string) {
    return await this.apiService.send(
      "POST",
      "/providers/" + providerId + "/billing/bank-account/verify-microdeposit",
      null,
      true,
      false,
    );
  }
}

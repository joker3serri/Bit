import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ProviderBillingClientAbstraction } from "@bitwarden/common/billing/abstractions/clients/provider-billing.client.abstraction";
import {
  CreateClientOrganizationRequest,
  ExpandedTaxInfoUpdateRequest,
  TokenizedPaymentMethodRequest,
  UpdateClientOrganizationRequest,
  VerifyBankAccountRequest,
} from "@bitwarden/common/billing/models/request";
import {
  PaymentMethodResponse,
  ProviderSubscriptionResponse,
  TaxInfoResponse,
} from "@bitwarden/common/billing/models/response";

export class ProviderBillingClient implements ProviderBillingClientAbstraction {
  constructor(private apiService: ApiService) {}

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

  async getPaymentMethod(providerId: string): Promise<PaymentMethodResponse | null> {
    try {
      const response = await this.apiService.send(
        "GET",
        "/providers/" + providerId + "/billing/payment-method",
        null,
        true,
        true,
      );
      return new PaymentMethodResponse(response);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async getSubscription(providerId: string): Promise<ProviderSubscriptionResponse> {
    const response = await this.apiService.send(
      "GET",
      "/providers/" + providerId + "/billing/subscription",
      null,
      true,
      true,
    );
    return new ProviderSubscriptionResponse(response);
  }

  async getTaxInformation(providerId: string): Promise<TaxInfoResponse | null> {
    try {
      const response = await this.apiService.send(
        "GET",
        "/providers/" + providerId + "/billing/tax-information",
        null,
        true,
        true,
      );
      return new TaxInfoResponse(response);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
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

  async updatePaymentMethod(providerId: string, request: TokenizedPaymentMethodRequest) {
    return await this.apiService.send(
      "PUT",
      "/providers/" + providerId + "/billing/payment-method",
      request,
      true,
      false,
    );
  }

  async updateTaxInformation(providerId: string, request: ExpandedTaxInfoUpdateRequest) {
    return await this.apiService.send(
      "PUT",
      "/providers/" + providerId + "/billing/tax-information",
      request,
      true,
      false,
    );
  }

  async verifyBankAccount(providerId: string, request: VerifyBankAccountRequest) {
    return await this.apiService.send(
      "POST",
      "/providers/" + providerId + "/billing/payment-method/verify-bank-account",
      request,
      true,
      false,
    );
  }
}

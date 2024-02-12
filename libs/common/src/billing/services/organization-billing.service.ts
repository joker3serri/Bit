import { OrganizationApiServiceAbstraction as OrganizationApiService } from "../../admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationCreateRequest } from "../../admin-console/models/request/organization-create.request";
import { OrganizationKeysRequest } from "../../admin-console/models/request/organization-keys.request";
import { OrganizationResponse } from "../../admin-console/models/response/organization.response";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { EncryptService } from "../../platform/abstractions/encrypt.service";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { OrgKey } from "../../types/key";
import { OrganizationBillingServiceAbstraction } from "../abstractions/organization-billing.service";
import {
  PurchaseOrganizationRequest,
  StartFreeOrganizationRequest,
} from "../models/domain/subscription-information";

export class OrganizationBillingService implements OrganizationBillingServiceAbstraction {
  constructor(
    private cryptoService: CryptoService,
    private encryptService: EncryptService,
    private i18nService: I18nService,
    private organizationApiService: OrganizationApiService,
  ) {}

  async purchaseOrganization(
    purchaseOrganizationRequest: PurchaseOrganizationRequest,
  ): Promise<OrganizationResponse> {
    const { organization, plan, payment } = purchaseOrganizationRequest;

    const request = await this.createKeyedRequest();

    request.name = organization.name;
    request.businessName = organization.businessName;
    request.billingEmail = organization.billingEmail;

    request.planType = plan.type;
    request.additionalSeats = plan.passwordManagerSeats;

    if (plan.subscribeToSecretsManager) {
      request.useSecretsManager = true;
      request.isFromSecretsManagerTrial = plan.isFromSecretsManagerTrial;
      request.additionalSmSeats = plan.secretsManagerSeats;
      request.additionalServiceAccounts = plan.secretsManagerServiceAccounts;
    }

    if (plan.storage) {
      request.additionalStorageGb = plan.storage;
    }

    const [paymentToken, paymentMethodType] = payment.paymentMethod;
    request.paymentToken = paymentToken;
    request.paymentMethodType = paymentMethodType;

    const billing = payment.billing;
    request.billingAddressPostalCode = billing.postalCode;
    request.billingAddressCountry = billing.country;

    if (billing.taxId) {
      request.taxIdNumber = billing.taxId;
      request.billingAddressLine1 = billing.addressLine1;
      request.billingAddressLine2 = billing.addressLine2;
      request.billingAddressCity = billing.city;
      request.billingAddressState = billing.state;
    }

    return await this.organizationApiService.create(request);
  }

  async startFreeOrganization(
    startFreeOrganizationRequest: StartFreeOrganizationRequest,
  ): Promise<OrganizationResponse> {
    const { organization, plan } = startFreeOrganizationRequest;

    const request = await this.createKeyedRequest();

    request.name = organization.name;
    request.businessName = organization.businessName;
    request.billingEmail = organization.billingEmail;

    if (plan) {
      request.useSecretsManager = plan.subscribeToSecretsManager;
      request.isFromSecretsManagerTrial = plan.isFromSecretsManagerTrial;
    }

    return await this.organizationApiService.create(request);
  }

  private async createKeyedRequest(): Promise<OrganizationCreateRequest> {
    const [encryptedKey, key] = await this.cryptoService.makeOrgKey<OrgKey>();
    const [publicKey, encryptedPrivateKey] = await this.cryptoService.makeKeyPair(key);
    const encryptedCollectionName = await this.encryptService.encrypt(
      this.i18nService.t("defaultCollection"),
      key,
    );

    const request = new OrganizationCreateRequest();
    request.key = encryptedKey.encryptedString;
    request.keys = new OrganizationKeysRequest(publicKey, encryptedPrivateKey.encryptedString);
    request.collectionName = encryptedCollectionName.encryptedString;

    return request;
  }
}

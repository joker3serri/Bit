import { OrganizationApiServiceAbstraction as OrganizationApiService } from "../../admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationCreateRequest } from "../../admin-console/models/request/organization-create.request";
import { OrganizationKeysRequest } from "../../admin-console/models/request/organization-keys.request";
import { OrganizationResponse } from "../../admin-console/models/response/organization.response";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { EncryptService } from "../../platform/abstractions/encrypt.service";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { OrgKey } from "../../types/key";
import { OrganizationBillingServiceAbstraction } from "../abstractions/organization-billing.service";
import { PlanType } from "../enums";
import {
  FreeOrganizationSignup,
  PaidOrganizationSignup,
} from "../models/domain/organization-signup";

export class OrganizationBillingService implements OrganizationBillingServiceAbstraction {
  constructor(
    private cryptoService: CryptoService,
    private encryptService: EncryptService,
    private i18nService: I18nService,
    private organizationApiService: OrganizationApiService,
  ) {}

  async purchase(signup: PaidOrganizationSignup): Promise<OrganizationResponse> {
    const request = await this.buildKeyedRequest();

    const { name, billingEmail, businessName } = signup.organization;
    request.name = name;
    request.billingEmail = billingEmail;
    request.businessName = businessName;

    const {
      type,
      passwordManagerSeats,
      subscribeToSecretsManager,
      isFromSecretsManagerTrial,
      secretsManagerSeats,
      secretsManagerServiceAccounts,
      storage,
    } = signup.plan;

    request.planType = type;

    request.additionalSeats = passwordManagerSeats;

    if (subscribeToSecretsManager) {
      request.useSecretsManager = true;
      request.isFromSecretsManagerTrial = isFromSecretsManagerTrial;
      request.additionalSmSeats = secretsManagerSeats;
      request.additionalServiceAccounts = secretsManagerServiceAccounts;
    }

    if (storage) {
      request.additionalStorageGb = storage;
    }

    const [paymentToken, paymentMethodType] = signup.payment.paymentMethod;
    const { postalCode, country, taxId, addressLine1, addressLine2, city, state } =
      signup.payment.billing;

    request.paymentToken = paymentToken;
    request.paymentMethodType = paymentMethodType;

    request.billingAddressPostalCode = postalCode;
    request.billingAddressCountry = country;

    if (taxId) {
      request.taxIdNumber = taxId;
      request.billingAddressLine1 = addressLine1;
      request.billingAddressLine2 = addressLine2;
      request.billingAddressCity = city;
      request.billingAddressState = state;
    }

    return await this.organizationApiService.create(request);
  }

  async startFree(signup: FreeOrganizationSignup): Promise<OrganizationResponse> {
    const request = await this.buildKeyedRequest();

    const { name, billingEmail, businessName } = signup.organization;
    request.name = name;
    request.billingEmail = billingEmail;
    request.businessName = businessName;

    request.planType = PlanType.Free;

    if (signup.plan && signup.plan.subscribeToSecretsManager) {
      request.useSecretsManager = true;
      request.isFromSecretsManagerTrial = signup.plan.isFromSecretsManagerTrial;
    }

    return await this.organizationApiService.create(request);
  }

  private async buildKeyedRequest(): Promise<OrganizationCreateRequest> {
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

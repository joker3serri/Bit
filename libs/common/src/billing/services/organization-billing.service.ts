import { concatMap, defer, filter, from, Observable, timer } from "rxjs";

import { OrganizationApiServiceAbstraction as OrganizationApiService } from "../../admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationCreateRequest } from "../../admin-console/models/request/organization-create.request";
import { OrganizationKeysRequest } from "../../admin-console/models/request/organization-keys.request";
import { OrganizationResponse } from "../../admin-console/models/response/organization.response";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { EncryptService } from "../../platform/abstractions/encrypt.service";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { EncString } from "../../platform/models/domain/enc-string";
import { ActiveUserState, StateProvider } from "../../platform/state";
import { OrgKey } from "../../types/key";
import { OrganizationBillingServiceAbstraction } from "../abstractions/organization-billing.service.abstraction";
import { PlanType } from "../enums";
import { ORGANIZATION_BILLING_KEY } from "../models/billing-keys.state";
import {
  OrganizationInformation,
  PaymentInformation,
  PlanInformation,
  SubscriptionInformation,
} from "../models/domain/subscription-information";
import { BillingResponse } from "../models/response/billing.response";

interface OrganizationKeys {
  encryptedKey: EncString;
  publicKey: string;
  encryptedPrivateKey: EncString;
  encryptedCollectionName: EncString;
}

const TEN_SECONDS_IN_MILLISECONDS = 10000;

export class OrganizationBillingService implements OrganizationBillingServiceAbstraction {
  private organizationBillingState: ActiveUserState<Record<string, BillingResponse>>;
  private refreshOrganizationBillingTimer$ = timer(0, TEN_SECONDS_IN_MILLISECONDS);
  organizationBilling$: Observable<Record<string, BillingResponse>>;

  constructor(
    private cryptoService: CryptoService,
    private encryptService: EncryptService,
    private i18nService: I18nService,
    private organizationApiService: OrganizationApiService,
    private organizationService: OrganizationService,
    private stateProvider: StateProvider,
  ) {
    this.organizationBillingState = this.stateProvider.getActive(ORGANIZATION_BILLING_KEY);
    this.organizationBilling$ = this.organizationBillingState.state$.pipe(
      filter((organizationBilling) => organizationBilling !== null),
    );

    const latestOrganizationBilling$ = defer(() => from(this.getOrganizationBilling()));

    this.refreshOrganizationBillingTimer$
      .pipe(concatMap(() => latestOrganizationBilling$))
      .subscribe((data) =>
        Promise.all(
          data.map(async ({ organizationId, billing }) => {
            await this.setOrganizationBilling(organizationId, billing);
          }),
        ),
      );
  }

  async purchaseSubscription(subscription: SubscriptionInformation): Promise<OrganizationResponse> {
    const request = new OrganizationCreateRequest();

    const organizationKeys = await this.makeOrganizationKeys();

    this.setOrganizationKeys(request, organizationKeys);

    this.setOrganizationInformation(request, subscription.organization);

    this.setPlanInformation(request, subscription.plan);

    this.setPaymentInformation(request, subscription.payment);

    return await this.organizationApiService.create(request);
  }

  async setOrganizationBilling(organizationId: string, billingResponse: BillingResponse) {
    await this.organizationBillingState.update((state) => {
      state ??= {};
      state[organizationId] = billingResponse;
      return state;
    });
  }

  async startFree(subscription: SubscriptionInformation): Promise<OrganizationResponse> {
    const request = new OrganizationCreateRequest();

    const organizationKeys = await this.makeOrganizationKeys();

    this.setOrganizationKeys(request, organizationKeys);

    this.setOrganizationInformation(request, subscription.organization);

    this.setPlanInformation(request, subscription.plan);

    return await this.organizationApiService.create(request);
  }

  private async getOrganizationBilling(): Promise<
    {
      organizationId: string;
      billing: BillingResponse;
    }[]
  > {
    const organizations = await this.organizationService.getAll();
    return await Promise.all(
      organizations.map(async (organization) => {
        const billing = await this.organizationApiService.getBilling(organization.id);
        return {
          organizationId: organization.id,
          billing,
        };
      }),
    );
  }

  private async makeOrganizationKeys(): Promise<OrganizationKeys> {
    const [encryptedKey, key] = await this.cryptoService.makeOrgKey<OrgKey>();
    const [publicKey, encryptedPrivateKey] = await this.cryptoService.makeKeyPair(key);
    const encryptedCollectionName = await this.encryptService.encrypt(
      this.i18nService.t("defaultCollection"),
      key,
    );
    return {
      encryptedKey,
      publicKey,
      encryptedPrivateKey,
      encryptedCollectionName,
    };
  }

  private setOrganizationInformation(
    request: OrganizationCreateRequest,
    information: OrganizationInformation,
  ): void {
    request.name = information.name;
    request.businessName = information.businessName;
    request.billingEmail = information.billingEmail;
  }

  private setOrganizationKeys(request: OrganizationCreateRequest, keys: OrganizationKeys): void {
    request.key = keys.encryptedKey.encryptedString;
    request.keys = new OrganizationKeysRequest(
      keys.publicKey,
      keys.encryptedPrivateKey.encryptedString,
    );
    request.collectionName = keys.encryptedCollectionName.encryptedString;
  }

  private setPaymentInformation(
    request: OrganizationCreateRequest,
    information: PaymentInformation,
  ) {
    const [paymentToken, paymentMethodType] = information.paymentMethod;
    request.paymentToken = paymentToken;
    request.paymentMethodType = paymentMethodType;

    const billingInformation = information.billing;
    request.billingAddressPostalCode = billingInformation.postalCode;
    request.billingAddressCountry = billingInformation.country;

    if (billingInformation.taxId) {
      request.taxIdNumber = billingInformation.taxId;
      request.billingAddressLine1 = billingInformation.addressLine1;
      request.billingAddressLine2 = billingInformation.addressLine2;
      request.billingAddressCity = billingInformation.city;
      request.billingAddressState = billingInformation.state;
    }
  }

  private setPlanInformation(
    request: OrganizationCreateRequest,
    information: PlanInformation,
  ): void {
    request.planType = information.type;

    if (request.planType === PlanType.Free) {
      request.useSecretsManager = information.subscribeToSecretsManager;
      request.isFromSecretsManagerTrial = information.isFromSecretsManagerTrial;
      return;
    }

    request.additionalSeats = information.passwordManagerSeats;

    if (information.subscribeToSecretsManager) {
      request.useSecretsManager = true;
      request.isFromSecretsManagerTrial = information.isFromSecretsManagerTrial;
      request.additionalSmSeats = information.secretsManagerSeats;
      request.additionalServiceAccounts = information.secretsManagerServiceAccounts;
    }

    if (information.storage) {
      request.additionalStorageGb = information.storage;
    }
  }
}

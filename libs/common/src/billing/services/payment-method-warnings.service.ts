import { concatMap, defer, filter, from, map, Observable, timer } from "rxjs";

import { OrganizationApiServiceAbstraction as OrganizationApiService } from "../../admin-console/abstractions/organization/organization-api.service.abstraction";
import {
  canAccessOrgAdmin,
  OrganizationService,
} from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { ProductType } from "../../enums";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { ActiveUserState, BILLING_DISK, KeyDefinition, StateProvider } from "../../platform/state";
import { PaymentMethodWarningServiceAbstraction } from "../abstractions/payment-method-warning.service.abstraction";
import { PaymentMethodWarning } from "../models/domain/payment-method-warning";
import { OrganizationRisksSubscriptionFailureResponse } from "../models/response/organization-risks-subscription-failure.response";

const PAYMENT_METHOD_WARNINGS_KEY = KeyDefinition.record<PaymentMethodWarning>(
  BILLING_DISK,
  "paymentMethodWarnings",
  {
    deserializer: (warnings) => warnings,
  },
);

const TEN_SECONDS_IN_MILLISECONDS = 10000;

export class PaymentMethodWarningsService implements PaymentMethodWarningServiceAbstraction {
  private paymentMethodWarningsState: ActiveUserState<Record<string, PaymentMethodWarning>>;
  private refreshTimer$ = timer(0, TEN_SECONDS_IN_MILLISECONDS);

  paymentMethodWarnings$: Observable<PaymentMethodWarning[]>;

  constructor(
    private i18nService: I18nService,
    private organizationApiService: OrganizationApiService,
    private organizationService: OrganizationService,
    private stateProvider: StateProvider,
  ) {
    this.paymentMethodWarningsState = this.stateProvider.getActive(PAYMENT_METHOD_WARNINGS_KEY);
    this.paymentMethodWarnings$ = this.paymentMethodWarningsState.state$.pipe(
      filter((warnings) => warnings != null),
      map((warnings) => Object.values(warnings)),
    );

    const latestSubscriptionRisks$ = defer(() => from(this.getSubscriptionRisks()));

    this.refreshTimer$
      .pipe(concatMap(() => latestSubscriptionRisks$))
      .subscribe((data) =>
        Promise.all(data.map(async (result) => await this.updatePaymentMethodWarning(result))),
      );
  }

  async acknowledgeWarning(organizationId: string): Promise<void> {
    await this.paymentMethodWarningsState.update((state) => {
      state ??= {};
      const current = state[organizationId];
      if (current !== null && current !== undefined) {
        state[organizationId] = {
          organizationId,
          missingPaymentMethod: current.missingPaymentMethod,
          acknowledged: true,
        };
      }
      return state;
    });
  }

  private async getSubscriptionRisks(): Promise<OrganizationRisksSubscriptionFailureResponse[]> {
    const organizations = await this.organizationService.getAll();
    return await Promise.all(
      organizations
        .filter(canAccessOrgAdmin)
        .filter((organization) => organization.planProductType !== ProductType.Free)
        .map((organization) =>
          this.organizationApiService.risksSubscriptionFailure(organization.id),
        ),
    );
  }

  private async updatePaymentMethodWarning(result: OrganizationRisksSubscriptionFailureResponse) {
    await this.paymentMethodWarningsState.update((state) => {
      state ??= {};
      const current = state[result.organizationId];
      if (current === null || current === undefined) {
        state[result.organizationId] = {
          organizationId: result.organizationId,
          missingPaymentMethod: result.risksSubscriptionFailure,
          acknowledged: false,
        };
      } else {
        state[result.organizationId] = {
          organizationId: result.organizationId,
          missingPaymentMethod: result.risksSubscriptionFailure,
          acknowledged: current.acknowledged,
        };
      }
      return state;
    });
  }
}

import { concatMap, defer, filter, Observable, timer } from "rxjs";

import { OrganizationApiServiceAbstraction as OrganizationApiService } from "../../admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { ActiveUserState, StateProvider } from "../../platform/state";
import { PaymentMethodWarningServiceAbstraction } from "../abstractions/payment-method-warning-service.abstraction";
import { PAYMENT_METHOD_WARNINGS_KEY } from "../models/billing-keys.state";
import { PaymentMethodWarning } from "../models/domain/payment-method-warning";
import { OrganizationBillingStatusResponse } from "../models/response/organization-billing-status.response";

const ONE_MINUTE_IN_MILLISECONDS = 60000;

export class PaymentMethodWarningService implements PaymentMethodWarningServiceAbstraction {
  paymentMethodWarnings$: Observable<Record<string, PaymentMethodWarning>>;

  private everyMinuteStartingNow$ = timer(0, ONE_MINUTE_IN_MILLISECONDS);
  private paymentMethodWarningsState: ActiveUserState<Record<string, PaymentMethodWarning>>;

  constructor(
    private organizationApiService: OrganizationApiService,
    private organizationService: OrganizationService,
    private stateProvider: StateProvider,
  ) {
    this.paymentMethodWarningsState = this.stateProvider.getActive(PAYMENT_METHOD_WARNINGS_KEY);
    this.paymentMethodWarnings$ = this.paymentMethodWarningsState.state$.pipe(
      filter((state) => state !== null),
    );

    const latestStatuses$: Observable<OrganizationBillingStatusResponse[]> = defer(() =>
      this.getOrganizationStatuses(),
    );

    this.everyMinuteStartingNow$.pipe(concatMap(() => latestStatuses$)).subscribe((statuses) => {
      statuses.forEach(async (status) => await this.updatePaymentMethodWarning(status));
    });
  }

  async acknowledge(organizationId: string): Promise<void> {
    await this.paymentMethodWarningsState.update((state) => {
      const current = state[organizationId];
      state[organizationId] = {
        organizationName: current.organizationName,
        risksSubscriptionFailure: current.risksSubscriptionFailure,
        acknowledged: true,
      };
      return state;
    });
  }

  async addedPaymentMethod(organizationId: string): Promise<void> {
    await this.paymentMethodWarningsState.update((state) => {
      const current = state[organizationId];
      state[organizationId] = {
        organizationName: current.organizationName,
        risksSubscriptionFailure: false,
        acknowledged: current.acknowledged,
      };
      return state;
    });
  }

  async clear(): Promise<void> {
    await this.paymentMethodWarningsState.update(() => ({}));
  }

  private async getOrganizationStatuses(): Promise<OrganizationBillingStatusResponse[]> {
    const organizations = await this.organizationService.getAll();
    return Promise.all(
      organizations.map(async ({ id }) => await this.organizationApiService.getBillingStatus(id)),
    );
  }

  private async updatePaymentMethodWarning({
    organizationId,
    organizationName,
    risksSubscriptionFailure,
  }: OrganizationBillingStatusResponse): Promise<void> {
    await this.paymentMethodWarningsState.update((state) => {
      state ??= {};
      const current = state[organizationId];
      if (current === null || current === undefined) {
        state[organizationId] = {
          organizationName,
          risksSubscriptionFailure,
          acknowledged: false,
        };
      } else {
        state[organizationId] = {
          organizationName,
          risksSubscriptionFailure,
          acknowledged: current.acknowledged,
        };
      }
      return state;
    });
  }
}

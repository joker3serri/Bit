import { map, Observable } from "rxjs";

import {
  ActiveUserState,
  ActiveUserStateProvider,
  BILLING_DISK,
  KeyDefinition,
} from "../../../platform/state";
import {
  BillingAccountProfile,
  BillingAccountProfileStateService,
} from "../../abstractions/account/billing-account-profile-state.service";

export const BILLING_ACCOUNT_PROFILE_KEY_DEFINITION = new KeyDefinition<BillingAccountProfile>(
  BILLING_DISK,
  "accountProfile",
  {
    deserializer: (billingAccountProfile) => billingAccountProfile,
  },
);

export class DefaultBillingAccountProfileStateService implements BillingAccountProfileStateService {
  private billingAccountProfileState: ActiveUserState<BillingAccountProfile>;

  hasPremiumFromOrganization$: Observable<boolean>;
  hasPremiumPersonally$: Observable<boolean>;
  canAccessPremium$: Observable<boolean>;

  constructor(activeUserStateProvider: ActiveUserStateProvider) {
    this.billingAccountProfileState = activeUserStateProvider.get(
      BILLING_ACCOUNT_PROFILE_KEY_DEFINITION,
    );

    this.hasPremiumFromOrganization$ = this.billingAccountProfileState.state$.pipe(
      map((billingAccountProfile) => !!billingAccountProfile?.hasPremiumFromOrganization),
    );

    this.hasPremiumPersonally$ = this.billingAccountProfileState.state$.pipe(
      map((billingAccountProfile) => !!billingAccountProfile?.hasPremiumPersonally),
    );

    this.canAccessPremium$ = this.billingAccountProfileState.state$.pipe(
      map(
        (billingAccountProfile) =>
          billingAccountProfile?.hasPremiumFromOrganization ||
          billingAccountProfile?.hasPremiumPersonally,
      ),
    );
  }

  async setHasPremium(
    hasPremiumPersonally: boolean,
    hasPremiumFromOrganization: boolean,
  ): Promise<void> {
    await this.billingAccountProfileState.update((billingAccountProfile) => {
      return {
        hasPremiumPersonally,
        hasPremiumFromOrganization,
      };
    });
  }
}

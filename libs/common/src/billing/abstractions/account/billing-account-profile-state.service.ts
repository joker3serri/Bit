import { Observable } from "rxjs";

export type BillingAccountProfile = {
  hasPremiumPersonally: boolean;
  hasPremiumFromOrganization: boolean;
};

export abstract class BillingAccountProfileStateService {
  hasPremiumFromOrganization$: Observable<boolean>;
  hasPremiumPersonally$: Observable<boolean>;
  canAccessPremium$: Observable<boolean>;

  abstract setHasPremium(
    hasPremiumPersonally: boolean,
    hasPremiumFromOrganization: boolean,
  ): Promise<void>;
}

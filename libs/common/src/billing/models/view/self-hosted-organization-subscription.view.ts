import { View } from "../../../models/view/view";
import { OrganizationSubscriptionResponse } from "../response/organization-subscription.response";

export class SelfHostedOrganizationSubscriptionView implements View {
  planName: string;

  /**
   * The expiration date of the subscription/organization, including any grace period.
   */
  private readonly _expirationWithGracePeriod?: Date;

  /**
   * The expiration date of the subscription, without any grace period.
   */
  private readonly _expirationWithoutGracePeriod?: Date;

  constructor(orgSub: OrganizationSubscriptionResponse) {
    if (orgSub == null) {
      return;
    }

    this.planName = orgSub.plan.name;
    this._expirationWithGracePeriod =
      orgSub.expiration != null ? new Date(orgSub.expiration) : null;
    this._expirationWithoutGracePeriod =
      orgSub.expirationWithoutGracePeriod != null
        ? new Date(orgSub.expirationWithoutGracePeriod)
        : null;
  }

  /**
   * The subscription has separate expiration dates for the subscription and the end of grace period.
   */
  get hasSeparateGracePeriod() {
    return this._expirationWithGracePeriod != null && this._expirationWithoutGracePeriod != null;
  }

  /**
   * Date the subscription, including any grace period, expires.
   */
  get gracePeriodExpiration(): Date | null {
    return this._expirationWithGracePeriod;
  }

  /**
   * Date the subscription expires.
   * - When the organization has a current (>= v12) license file, this value **excludes** the grace period.
   * - When the organization has an older (< v12) license file, this value **includes** the grace period for
   * backwards compatability.
   */
  get expiration(): Date | null {
    // We fall back to the expiration with grace period, as old licenses don't have separate expiration dates.
    return this._expirationWithoutGracePeriod ?? this._expirationWithGracePeriod;
  }

  /**
   * True if the subscription has any expiration date.
   */
  get hasExpiration() {
    return this.expiration != null;
  }

  /**
   * True if the subscription has an expiration date that has past.
   */
  get isExpired() {
    return this.hasExpiration && this.expiration < new Date();
  }
}

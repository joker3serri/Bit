import { BitwardenProductType } from "../../enums/bitwarden-product-type.enum";

export class OrganizationSubscriptionUpdateRequest {
  productType: BitwardenProductType;

  /**
   * The number of seats to add or remove from the subscription.
   * Applies to both PM and SM request types.
   */
  seatAdjustment: number;

  /**
   * The maximum number of seats that can be auto-scaled for the subscription.
   * Applies to both PM and SM request types.
   */
  maxAutoscaleSeats?: number;

  /**
   * The number of additional service accounts to add or remove from the subscription.
   * Applies only to the SM request type.
   */
  serviceAccountAdjustment?: number;

  /**
   * The maximum number of additional service accounts that can be auto-scaled for the subscription.
   * Applies only to the SM request type.
   */
  maxAutoscaleServiceAccounts?: number;

  constructor(productType: BitwardenProductType) {
    this.productType = productType;
  }

  /**
   * Build a subscription update request for the Password Manager product type.
   * @param seatAdjustment - The number of seats to add or remove from the subscription.
   * @param maxAutoscaleSeats - The maximum number of seats that can be auto-scaled for the subscription.
   */
  static forPasswordManager(
    seatAdjustment: number,
    maxAutoscaleSeats?: number
  ): OrganizationSubscriptionUpdateRequest {
    const request = new OrganizationSubscriptionUpdateRequest(BitwardenProductType.PasswordManager);
    request.seatAdjustment = seatAdjustment;
    request.maxAutoscaleSeats = maxAutoscaleSeats;
    return request;
  }

  /**
   * Build a subscription update request for the Secrets Manager product type.
   * @param seatAdjustment - The number of seats to add or remove from the subscription.
   * @param serviceAccountAdjustment - The number of additional service accounts to add or remove from the subscription.
   * @param maxAutoscaleSeats - The maximum number of seats that can be auto-scaled for the subscription.
   * @param maxAutoscaleServiceAccounts - The maximum number of additional service accounts that can be auto-scaled for the subscription.
   */
  static forSecretsManager(
    seatAdjustment: number,
    serviceAccountAdjustment: number,
    maxAutoscaleSeats?: number,
    maxAutoscaleServiceAccounts?: number
  ): OrganizationSubscriptionUpdateRequest {
    const request = new OrganizationSubscriptionUpdateRequest(BitwardenProductType.SecretsManager);
    request.seatAdjustment = seatAdjustment;
    request.serviceAccountAdjustment = serviceAccountAdjustment;
    request.maxAutoscaleSeats = maxAutoscaleSeats;
    request.maxAutoscaleServiceAccounts = maxAutoscaleServiceAccounts;
    return request;
  }
}

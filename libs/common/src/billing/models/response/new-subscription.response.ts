import { BaseResponse } from "../../../models/response/base.response";

class SubscriptionCancellationResponse extends BaseResponse {
  /** The date at which the subscription cancellation was requested. */
  start?: Date;
  /** The date at which the subscription is set to be cancelled, if it was not cancelled immediately. */
  end?: Date;
  /** Whether the subscription is pending cancellation. */
  active: boolean;
  /** Whether the subscription was set to cancel at the end of the period rather than cancel immediately. */
  cancelAtEndOfPeriod: boolean;

  constructor(response: any) {
    super(response);
    this.start = this.getResponseProperty("Start");
    this.end = this.getResponseProperty("End");
    this.active = this.getResponseProperty("Active");
    this.cancelAtEndOfPeriod = this.getResponseProperty("CancelAtEndOfPeriod");
  }
}

class SubscriptionDiscountResponse extends BaseResponse {
  /** The ID of the {@link https://docs.stripe.com/api/discounts|Discount} object within Stripe. */
  stripeId: string;
  /** The date at which the discount became active. */
  start?: Date;
  /** The date at which the discount ended. */
  end?: Date;
  /** Whether the discount is currently active. */
  active: boolean;
  /** The percent off the discount applies to its applicable products. */
  percentOff?: number;
  /** The Stripe IDs of the products the discount applies to. */
  applicableStripeProductIds: string[];

  constructor(response: any) {
    super(response);
    this.stripeId = this.getResponseProperty("StripeId");
    this.start = this.getResponseProperty("Start");
    this.end = this.getResponseProperty("End");
    this.active = this.getResponseProperty("Active");
    this.percentOff = this.getResponseProperty("PercentOff");
    this.applicableStripeProductIds = this.getResponseProperty("ApplicableStripeProductIds");
  }
}

class SubscriptionItemResponse extends BaseResponse {
  /** The ID of the {@link https://docs.stripe.com/api/subscription_items|Subscription Item} object within Stripe. */
  stripeId: string;
  /** The ID of the {@link https://docs.stripe.com/api/prices|Price} object within Stripe. */
  stripePriceId: string;
  /** The name of the subscription item's associated price. */
  name: string;
  /** The unit amount of the subscription item's associated price. */
  amount?: number;
  /** The recurrence interval of the subscription item's associated price. */
  interval: string;
  /** The quantity of the subscription item. */
  quantity: number;
  /** Whether the subscription item's associated price ID belongs to a Bitwarden Sponsored Plan. */
  sponsored: boolean;
  /** Whether the subscription item's associated price ID belongs to a Bitwarden Add-On Plan. */
  addOn: boolean;

  constructor(response: any) {
    super(response);
    this.stripeId = this.getResponseProperty("StripeId");
    this.stripePriceId = this.getResponseProperty("StripePriceId");
    this.name = this.getResponseProperty("Name");
    this.amount = this.getResponseProperty("Amount");
    this.interval = this.getResponseProperty("Interval");
    this.quantity = this.getResponseProperty("Quantity");
    this.sponsored = this.getResponseProperty("Sponsored");
    this.addOn = this.getResponseProperty("AddOn");
  }
}

class SubscriptionPeriodResponse extends BaseResponse {
  /** The date the period began. */
  start: Date;
  /** The date the period ended. */
  end: Date;
  /** Whether the period is currently active. */
  active: boolean;
  /** The duration of the period. */
  duration: number;

  constructor(response: any) {
    super(response);
    this.start = this.getResponseProperty("Start");
    this.end = this.getResponseProperty("End");
    this.active = this.getResponseProperty("Active");
    this.duration = this.getResponseProperty("Duration");
  }
}

export class SubscriptionResponse extends BaseResponse {
  /** The ID of the {@link https://docs.stripe.com/api/subscriptions|Subscription} object within Stripe. */
  stripeId: string;
  /** The {@link https://docs.stripe.com/api/subscriptions/object#subscription_object-status|status} of the subscription. See linked documentation for possible values. */
  status: string;
  /** The products included in the subscription. */
  items: SubscriptionItemResponse[];
  /** Any discount applied to the subscription's customer. */
  discount?: SubscriptionDiscountResponse;
  /** The subscription's current period. */
  currentPeriod: SubscriptionPeriodResponse;
  /** Any cancellation details pertaining to the subscription if it has been cancelled. */
  cancellation?: SubscriptionCancellationResponse;

  constructor(response: any) {
    super(response);
    this.stripeId = this.getResponseProperty("StripeId");
    this.status = this.getResponseProperty("Status");

    const items = this.getResponseProperty("Items");
    this.items = items.map((item: any) => new SubscriptionItemResponse(item));

    const discount = this.getResponseProperty("Discount");
    this.discount = discount == null ? null : new SubscriptionDiscountResponse(discount);

    const currentPeriod = this.getResponseProperty("CurrentPeriod");
    this.currentPeriod = new SubscriptionPeriodResponse(currentPeriod);

    const cancellation = this.getResponseProperty("Cancellation");
    this.cancellation =
      cancellation == null ? null : new SubscriptionCancellationResponse(cancellation);
  }
}

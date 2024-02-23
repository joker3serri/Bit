import { Jsonify } from "type-fest";

import { SubscriptionResponse } from "../response/new-subscription.response";

export type SubscriptionDiscount = {
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
  appliesTo: string[];
};

export type SubscriptionItem = {
  /** The ID of the {@link https://docs.stripe.com/api/subscription_items|Subscription Item} object within Stripe. */
  stripeId: string;
  /** The ID of the {@link https://docs.stripe.com/api/prices|Price} object within Stripe. */
  stripePriceId: string;
  /** The name of the subscription item's associated product. */
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
};

const statuses = <const>[
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "unknown",
];

type SubscriptionStatus = (typeof statuses)[number];

const validStatus = (input: string): input is SubscriptionStatus => {
  return !!statuses.find((status) => status === input);
};

/** A representation of a Stripe {@link https://docs.stripe.com/api/subscriptions|Subscription} object. */
export class Subscription {
  /** The ID of the {@link https://docs.stripe.com/api/subscriptions|Subscription} object within Stripe. */
  stripeId: string;
  /** The {@link https://docs.stripe.com/api/subscriptions/object#subscription_object-status|status} of the Stripe subscription. */
  status: SubscriptionStatus;
  /** The items included in the subscription. */
  items: SubscriptionItem[];
  /** The subscription's current period. */
  currentPeriod: {
    /** The date the period began. */
    start: Date;
    /** The date the period ended. */
    end: Date;
  };
  /** Any discount applied to the subscription's customer. */
  discount?: SubscriptionDiscount;
  /** Any important warnings related to the subscription. */
  warnings?: {
    /** The date at which the subscription will be suspended if past due invoices are not paid. */
    suspensionDate?: Date;
  };
  /** Any cancellation details pertaining to the subscription if it has been cancelled. */
  cancellation?: {
    /** The date at which the subscription cancellation was requested. */
    canceledAt: Date;
    /** The date at which the subscription is set to be cancelled, if it was not cancelled immediately. */
    cancelAt?: Date;
    /** Whether the subscription is pending cancellation. */
    pending: boolean;
  };

  static from(json: SubscriptionResponse | Jsonify<Subscription>): Subscription {
    const subscription: Subscription = {
      stripeId: json.stripeId,
      status: validStatus(json.status) ? json.status : "unknown",
      items: json.items.map((item) => ({
        ...item,
      })),
      currentPeriod: {
        start: new Date(json.currentPeriod.start),
        end: new Date(json.currentPeriod.end),
      },
    };

    const dateOrNull = (input?: string) => (input ? new Date(input) : null);

    if (json.discount) {
      subscription.discount = {
        ...json.discount,
        start: dateOrNull(json.discount.start),
        end: dateOrNull(json.discount.end),
      };
    }

    if (json.warnings) {
      subscription.warnings = {
        suspensionDate: dateOrNull(json.warnings.suspensionDate),
      };
    }

    if (json.cancellation) {
      subscription.cancellation = {
        canceledAt: new Date(json.cancellation.canceledAt),
        cancelAt: dateOrNull(json.cancellation.cancelAt),
        pending: json.cancellation.pending,
      };
    }

    return subscription;
  }
}

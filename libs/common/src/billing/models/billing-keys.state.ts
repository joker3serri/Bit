import { Jsonify } from "type-fest";

import { BILLING_DISK, KeyDefinition } from "../../platform/state";
import { Subscription } from "../models/domain/subscription";

export const ORGANIZATION_SUBSCRIPTION_KEY = KeyDefinition.record<Subscription>(
  BILLING_DISK,
  "organizationSubscription",
  {
    deserializer: (json: Jsonify<Subscription>) => Subscription.from(json),
  },
);

import { BILLING_DISK, KeyDefinition } from "../../platform/state";
import { BillingResponse } from "../models/response/billing.response";

export const ORGANIZATION_BILLING_KEY = KeyDefinition.record<BillingResponse>(
  BILLING_DISK,
  "organizationBilling",
  {
    deserializer: (billing: BillingResponse) => billing,
  },
);

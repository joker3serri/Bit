import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { PaymentMethodResponse } from "@bitwarden/common/billing/models/response";

export class PaymentMethod {
  type: PaymentMethodType;
  description: string;
  needsVerification: boolean;

  static from(response: PaymentMethodResponse | null) {
    if (response === null) {
      return null;
    }
    return {
      ...response,
    };
  }
}

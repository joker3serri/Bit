import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { TaxInformation } from "@bitwarden/common/billing/models/domain/tax-information";

export class UpdateProviderPaymentRequest {
  paymentMethod: {
    type: PaymentMethodType;
    token: string;
  };
  taxInformation: TaxInformation;
}

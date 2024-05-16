import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { ExpandedTaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/expanded-tax-info-update.request";

export class UpdateProviderPaymentInformationRequest {
  paymentMethod: {
    type: PaymentMethodType;
    token: string;
  };
  taxInformation: ExpandedTaxInfoUpdateRequest;
}

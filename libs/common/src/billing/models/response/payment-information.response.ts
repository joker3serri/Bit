import { BaseResponse } from "../../../models/response/base.response";

import { PaymentMethodResponse } from "./payment-method.response";
import { TaxInfoResponse } from "./tax-info.response";

export class PaymentInformationResponse extends BaseResponse {
  accountCredit: number;
  paymentMethod?: PaymentMethodResponse;
  taxInformation?: TaxInfoResponse;

  constructor(response: any) {
    super(response);
    this.accountCredit = this.getResponseProperty("AccountCredit");

    const paymentMethod = this.getResponseProperty("PaymentMethod");
    if (paymentMethod) {
      this.paymentMethod = new PaymentMethodResponse(paymentMethod);
    }

    const taxInformation = this.getResponseProperty("TaxInformation");
    if (taxInformation) {
      this.taxInformation = new TaxInfoResponse(taxInformation);
    }
  }
}

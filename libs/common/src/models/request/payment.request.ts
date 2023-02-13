import { PaymentMethodType } from "../../billing/enums/payment-method-type";
import { OrganizationTaxInfoUpdateRequest } from "../../billing/models/request/organization-tax-info-update.request";

export class PaymentRequest extends OrganizationTaxInfoUpdateRequest {
  paymentMethodType: PaymentMethodType;
  paymentToken: string;
}

import { Observable } from "rxjs";

import { PaymentMethodWarning } from "../models/domain/payment-method-warning";

export abstract class PaymentMethodWarningServiceAbstraction {
  paymentMethodWarnings$: Observable<PaymentMethodWarning[]>;
  acknowledgeWarning: (organizationId: string) => Promise<void>;
}

import { Observable } from "rxjs";

import { PaymentMethodWarning } from "../models/domain/payment-method-warning";

export abstract class PaymentMethodWarningsServiceAbstraction {
  paymentMethodWarnings$: Observable<Record<string, PaymentMethodWarning>>;
  acknowledge: (organizationId: string) => Promise<void>;
  addedPaymentMethod: (organizationId: string) => Promise<void>;
  clear: () => Promise<void>;
  update: (organizationId: string) => Promise<void>;
}

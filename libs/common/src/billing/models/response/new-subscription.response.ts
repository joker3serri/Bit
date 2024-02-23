import { BaseResponse } from "../../../models/response/base.response";

class SubscriptionCancellationResponse extends BaseResponse {
  canceledAt: string;
  cancelAt?: string;
  pending: boolean;

  constructor(response: any) {
    super(response);
    this.canceledAt = this.getResponseProperty("start");
    this.cancelAt = this.getResponseProperty("end");
    this.pending = this.getResponseProperty("active");
  }
}

class SubscriptionDiscountResponse extends BaseResponse {
  stripeId: string;
  start?: string;
  end?: string;
  active: boolean;
  percentOff?: number;
  appliesTo: string[];

  constructor(response: any) {
    super(response);
    this.stripeId = this.getResponseProperty("stripeId");
    this.start = this.getResponseProperty("start");
    this.end = this.getResponseProperty("end");
    this.active = this.getResponseProperty("active");
    this.percentOff = this.getResponseProperty("percentOff");
    this.appliesTo = this.getResponseProperty("appliesTo");
  }
}

class SubscriptionItemResponse extends BaseResponse {
  stripeId: string;
  stripePriceId: string;
  name: string;
  amount?: number;
  interval: string;
  quantity: number;
  sponsored: boolean;
  addOn: boolean;

  constructor(response: any) {
    super(response);
    this.stripeId = this.getResponseProperty("stripeId");
    this.stripePriceId = this.getResponseProperty("stripePriceId");
    this.name = this.getResponseProperty("name");
    this.amount = this.getResponseProperty("amount");
    this.interval = this.getResponseProperty("interval");
    this.quantity = this.getResponseProperty("quantity");
    this.sponsored = this.getResponseProperty("sponsored");
    this.addOn = this.getResponseProperty("addOn");
  }
}

class SubscriptionPeriodResponse extends BaseResponse {
  start: string;
  end: string;

  constructor(response: any) {
    super(response);
    this.start = this.getResponseProperty("start");
    this.end = this.getResponseProperty("end");
  }
}

class SubscriptionWarningsResponse extends BaseResponse {
  suspensionDate?: string;

  constructor(response: any) {
    super(response);
    this.suspensionDate = this.getResponseProperty("suspensionDate");
  }
}

export class SubscriptionResponse extends BaseResponse {
  stripeId: string;
  status: string;
  items: SubscriptionItemResponse[];
  discount?: SubscriptionDiscountResponse;
  currentPeriod: SubscriptionPeriodResponse;
  cancellation?: SubscriptionCancellationResponse;
  warnings?: SubscriptionWarningsResponse;

  constructor(response: any) {
    super(response);
    this.stripeId = this.getResponseProperty("stripeId");
    this.status = this.getResponseProperty("status");

    const items = this.getResponseProperty("items");
    this.items = items.map((item: any) => new SubscriptionItemResponse(item));

    const discount = this.getResponseProperty("discount");
    this.discount = discount == null ? null : new SubscriptionDiscountResponse(discount);

    const currentPeriod = this.getResponseProperty("currentPeriod");
    this.currentPeriod = new SubscriptionPeriodResponse(currentPeriod);

    const cancellation = this.getResponseProperty("cancellation");
    this.cancellation =
      cancellation == null ? null : new SubscriptionCancellationResponse(cancellation);

    const warnings = this.getResponseProperty("warnings");
    this.warnings = warnings == null ? null : new SubscriptionWarningsResponse(warnings);
  }
}

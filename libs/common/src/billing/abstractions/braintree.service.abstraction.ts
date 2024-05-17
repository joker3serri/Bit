export abstract class BraintreeServiceAbstraction {
  createDropin: () => void;
  loadBraintree: (containerId: string, autoCreateDropin: boolean) => void;
  requestPaymentMethod: () => string;
  unloadBraintree: () => void;
}

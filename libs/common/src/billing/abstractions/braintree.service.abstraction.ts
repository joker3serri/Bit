export abstract class BraintreeServiceAbstraction {
  createDropin: () => void;
  loadBraintree: (containerId: string, autoCreateDropin: boolean) => void;
  requestPaymentMethod: () => Promise<string>;
  unloadBraintree: () => void;
}

export abstract class BraintreeServiceAbstraction {
  loadBraintree: (containerId: string) => void;
  unloadBraintree: () => void;
}

export default class Deferred<T> {
  private promise: Promise<T>;
  private resolver: (T?) => void;
  private rejecter: (Error?) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
  }

  resolve(value?: T) {
    this.resolver(value);
  }

  reject(error?: Error) {
    this.rejecter(error);
  }

  getPromise(): Promise<T> {
    return this.promise;
  }
}

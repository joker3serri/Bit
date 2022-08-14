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

  public resolve(value?: T) {
    this.resolver(value);
  }

  public reject(error?: Error) {
    this.rejecter(error);
  }

  public getPromise(): Promise<T> {
    return this.promise;
  }
}

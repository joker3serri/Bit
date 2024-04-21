export class Lazy<T> {
  private _promise: Promise<T> | undefined = undefined;

  constructor(private readonly factory: () => Promise<T> | T) {}

  /**
   * Resolves the factory and returns the result. Guaranteed to resolve the value only once.
   *
   * @returns Promise resolving the result of the factory
   */
  async get(): Promise<T> {
    if (this._promise === undefined) {
      this._promise = this.inner_get();
    }
    return await this._promise;
  }

  /**
   * Ensures the factory is only called once
   * @returns Promise resolving the result of the factory
   */
  private async inner_get(): Promise<T> {
    const p = this.factory();

    if (p instanceof Promise) {
      return await p;
    }

    return Promise.resolve(p);
  }
}

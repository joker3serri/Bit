export class Lazy<T> {
  private _promise: Promise<T> | undefined = undefined;

  constructor(private readonly factory: () => Promise<T>) {}

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
   * Ensures the factory is only called once by forcing the value returned by the factory to be a promise and storing it in a private field.
   * @returns Promise resolving the result of the factory
   */
  private async inner_get(): Promise<T> {
    return await this.factory();
  }
}

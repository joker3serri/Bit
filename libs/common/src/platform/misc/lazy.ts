export class Lazy<T> {
  private _value: T | undefined = undefined;
  private _isCreated = false;

  constructor(private readonly factory: () => T) {}

  /**
   * Resolves the factory and returns the result. Guaranteed to resolve the value only once.
   *
   * @returns Promise resolving the result of the factory
   */
  get(): T {
    if (!this._isCreated) {
      this._isCreated = true;
      this._value = this.factory();
    }

    return this._value as T;
  }
}

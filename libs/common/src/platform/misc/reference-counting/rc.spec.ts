// Temporary workaround for Symbol.dispose
// remove when https://github.com/jestjs/jest/issues/14874 is resolved and *released*
const disposeSymbol: unique symbol = Symbol("Symbol.dispose");
const asyncDisposeSymbol: unique symbol = Symbol("Symbol.asyncDispose");
(Symbol as any).asyncDispose ??= asyncDisposeSymbol as unknown as SymbolConstructor["asyncDispose"];
(Symbol as any).dispose ??= disposeSymbol as unknown as SymbolConstructor["dispose"];

// Import needs to be after the workaround
import { Rc } from "./rc";

export class FreeableTestValue {
  isFreed = false;

  free() {
    this.isFreed = true;
  }
}

describe("Rc", () => {
  let value: FreeableTestValue;
  let rc: Rc<FreeableTestValue>;

  beforeEach(() => {
    value = new FreeableTestValue();
    rc = new Rc(value);
  });

  it("should increase refCount when taken", () => {
    rc.take();

    expect(rc["refCount"]).toBe(1);
  });

  it("should return value on take", () => {
    const reference = rc.take();

    expect(reference.value).toBe(value);
  });

  it("should decrease refCount when disposing reference", () => {
    const reference = rc.take();

    reference[Symbol.dispose]();

    expect(rc["refCount"]).toBe(0);
  });

  it("should automatically decrease refCount when reference goes out of scope", () => {
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      using reference = rc.take();
    }

    expect(rc["refCount"]).toBe(0);
  });

  it("should not free value when refCount reaches 0 if not marked for disposal", () => {
    const reference = rc.take();

    reference[Symbol.dispose]();

    expect(value.isFreed).toBe(false);
  });

  it("should free value when refCount reaches 0 and rc is marked for disposal", () => {
    const reference = rc.take();
    rc.markForDisposal();

    reference[Symbol.dispose]();

    expect(value.isFreed).toBe(true);
  });

  it("should free value when marked for disposal if refCount is 0", () => {
    const reference = rc.take();
    reference[Symbol.dispose]();

    rc.markForDisposal();

    expect(value.isFreed).toBe(true);
  });

  it("should throw error when trying to take a disposed reference", () => {
    rc.markForDisposal();

    expect(() => rc.take()).toThrow();
  });
});

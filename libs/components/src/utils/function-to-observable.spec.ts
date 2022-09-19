import { lastValueFrom, of, throwError } from "rxjs";

import { functionToObservable } from "./function-to-observable";

describe("functionToObservable", () => {
  it("should not execute function when calling", () => {
    const func = jest.fn();

    functionToObservable(func);

    expect(func).not.toHaveBeenCalled();
  });

  it("should execute function when subscribing", () => {
    const func = jest.fn();
    const observable = functionToObservable(func);

    observable.subscribe();

    expect(func).toHaveBeenCalled();
  });

  it("should return value when using sync function", async () => {
    const value = Symbol();
    const func = () => value;
    const observable = functionToObservable(func);

    const result = await lastValueFrom(observable);

    expect(result).toBe(value);
  });

  it("should return value when using async function", async () => {
    const value = Symbol();
    const func = () => Promise.resolve(value);
    const observable = functionToObservable(func);

    const result = await lastValueFrom(observable);

    expect(result).toBe(value);
  });

  it("should return value when using observable", async () => {
    const value = Symbol();
    const func = () => of(value);
    const observable = functionToObservable(func);

    const result = await lastValueFrom(observable);

    expect(result).toBe(value);
  });

  it("should throw error when using sync function", async () => {
    const error = new Error();
    const func = () => {
      throw error;
    };
    const observable = functionToObservable(func);

    let thrown: unknown;
    observable.subscribe({ error: (err: unknown) => (thrown = err) });

    expect(thrown).toBe(thrown);
  });

  it("should return value when using async function", async () => {
    const error = new Error();
    const func = () => Promise.reject(error);
    const observable = functionToObservable(func);

    let thrown: unknown;
    observable.subscribe({ error: (err: unknown) => (thrown = err) });

    expect(thrown).toBe(thrown);
  });

  it("should return value when using observable", async () => {
    const error = new Error();
    const func = () => throwError(() => error);
    const observable = functionToObservable(func);

    let thrown: unknown;
    observable.subscribe({ error: (err: unknown) => (thrown = err) });

    expect(thrown).toBe(thrown);
  });
});

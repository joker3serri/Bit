import { Provider } from "@angular/core";
import { Constructor, Opaque } from "type-fest";

import { SafeInjectionToken } from "../services/injection-tokens";

/**
 * The return type of our dependency helper functions.
 * Used to distinguish a type safe provider definition from a non-type safe provider definition.
 */
export type SafeProvider = Opaque<Provider>;

// TODO: type-fest also provides a type like this when we upgrade >= 3.7.0
type AbstractConstructor<T> = abstract new (...args: any) => T;

type MapParametersToDeps<T> = {
  [K in keyof T]: AbstractConstructor<T[K]> | SafeInjectionToken<T[K]>;
};

type SafeInjectionTokenType<T> = T extends SafeInjectionToken<infer J> ? J : never;

/**
 * Register a dependency in the providers array using the useClass option.
 * Guarantees that the values are type safe, e.g. you have correctly specified the deps for your implementation.
 */
export const useClass = <
  A extends AbstractConstructor<any>, // A is an abstract class
  I extends Constructor<InstanceType<A>>, // I is the implementation, it has a non-abstract ctor that returns a type that extends A
  D extends MapParametersToDeps<ConstructorParameters<I>>, // accept an array of constructor types OR injection tokens matching ctor parameters
>(obj: {
  provide: A;
  useClass: I;
  deps: D;
}) => obj as Provider as SafeProvider;

/**
 * Register a dependency in the providers array using the useValue option.
 * Guarantees that the values are type safe, e.g. the value type matches the InjectionToken type.
 */
export const useValue = <
  A extends SafeInjectionToken<any>,
  V extends SafeInjectionTokenType<A>,
>(obj: {
  provide: A;
  useValue: V;
}) => obj as SafeProvider;

type FunctionOrConstructorParameters<T> =
  T extends Constructor<any>
    ? ConstructorParameters<T>
    : T extends (...args: any) => any
      ? Parameters<T>
      : never;

/**
 * Register a dependency in the providers array using the useFactory option.
 * Guarantees that the values are type safe, e.g. you have correctly specified the deps for your function.
 */
export const useFactory = <
  A extends SafeInjectionToken<any> | AbstractConstructor<any>,
  I extends (
    ...args: any
  ) => A extends SafeInjectionToken<any>
    ? SafeInjectionTokenType<A>
    : A extends AbstractConstructor<any>
      ? InstanceType<A>
      : never,
  D extends MapParametersToDeps<FunctionOrConstructorParameters<I>>,
>(obj: {
  provide: A;
  useFactory: I;
  deps: D;
}) => obj as unknown as SafeProvider; // prevented from casting to Provider because D can be 'never'

/**
 * Register a dependency in the providers array using the useExisting option.
 * Provides only limited type safety, be careful.
 * @remarks This is not fully type safe because we often use this to register for "Internal" variants where the
 * developer knows that the existing definition implements an extended interface, but this is not discoverable via the
 * type system.
 */
export const useExisting = <
  A extends Constructor<any> | AbstractConstructor<any>,
  I extends Constructor<Partial<InstanceType<A>>> | AbstractConstructor<Partial<InstanceType<A>>>,
>(obj: {
  provide: A;
  useExisting: I;
}) => obj as SafeProvider;

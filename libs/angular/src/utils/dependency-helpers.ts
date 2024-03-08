import { Provider } from "@angular/core";
import { Constructor, Opaque } from "type-fest";

import { SafeInjectionToken } from "../services/injection-tokens";

// TODO: type-fest also provides a type like this when we upgrade >= 3.7.0
type AbstractConstructor<T> = abstract new (...args: any) => T;

type MapParametersToDeps<T> = {
  [K in keyof T]: AbstractConstructor<T[K]> | SafeInjectionToken<T[K]>;
};

type SafeInjectionTokenType<T> = T extends SafeInjectionToken<infer J> ? J : never;

export type SafeProvider = Opaque<Provider>;

export const useClass = <
  A extends AbstractConstructor<any>, // A is an abstract class
  I extends Constructor<InstanceType<A>>, // I is the implementation, it has a non-abstract ctor that returns a type that extends A
  D extends MapParametersToDeps<ConstructorParameters<I>>, // accept an array of constructor types OR injection tokens matching ctor parameters
>(obj: {
  provide: A;
  useClass: I;
  deps: D;
}) => obj as Provider as SafeProvider;

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

// This is less strict than other helpers because of our current usage.
// We often use useExisting to register "Internal" variants of classes that are in fact implemented
// by an existing provider but not exposed by its abstract interface. We can't know that here, so we have to settle
// for using Partial which at least ensures some overlap.
export const useExisting = <
  A extends Constructor<any> | AbstractConstructor<any>,
  I extends Constructor<Partial<InstanceType<A>>> | AbstractConstructor<Partial<InstanceType<A>>>,
>(obj: {
  provide: A;
  useExisting: I;
}) => obj as SafeProvider;

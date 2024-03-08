import { Constructor } from "type-fest";

import { SafeInjectionToken } from "../services/injection-tokens";

// TODO: type-fest also provides a type like this when we upgrade >= 3.7.0
type AbstractConstructor<T> = abstract new (...args: any) => T;

type MapParametersToDeps<T> = {
  [K in keyof T]: AbstractConstructor<T[K]> | SafeInjectionToken<T[K]>;
};

type SafeInjectionTokenType<T> = T extends SafeInjectionToken<infer J> ? J : never;

export const useClass = <
  A extends AbstractConstructor<InstanceType<A>>, // A is an abstract class
  I extends Constructor<InstanceType<A>>, // I is the implementation, it has a non-abstract ctor that returns a type that extends A
  D extends MapParametersToDeps<ConstructorParameters<I>>, // accept an array of constructor types OR injection tokens matching ctor parameters
>(obj: {
  provide: A;
  useClass: I;
  deps: D;
}) => obj;

export const useValue = <
  A extends SafeInjectionToken<any>,
  V extends SafeInjectionTokenType<A>,
>(obj: {
  provide: A;
  useValue: V;
}) => obj;

export const useFactory = <
  A extends SafeInjectionToken<any>,
  I extends (...args: any) => SafeInjectionTokenType<A>,
  D extends MapParametersToDeps<Parameters<I>>,
>(obj: {
  provide: A;
  useFactory: I;
  deps: D;
}) => obj;

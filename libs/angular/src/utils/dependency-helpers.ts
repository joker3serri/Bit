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
 * Represents a dependency provided with the useClass option.
 */
type SafeClassProvider<
  A extends AbstractConstructor<any>,
  I extends Constructor<InstanceType<A>>,
  D extends MapParametersToDeps<ConstructorParameters<I>>,
> = {
  provide: A;
  useClass: I;
  deps: D;
};

/**
 * Represents a dependency provided with the useValue option.
 */
type SafeValueProvider<A extends SafeInjectionToken<any>, V extends SafeInjectionTokenType<A>> = {
  provide: A;
  useValue: V;
};

type FunctionOrConstructorParameters<T> =
  T extends Constructor<any>
    ? ConstructorParameters<T>
    : T extends (...args: any) => any
      ? Parameters<T>
      : never;

/**
 * Represents a dependency provided with the useFactory option.
 */
type SafeFactoryProvider<
  A extends SafeInjectionToken<any> | AbstractConstructor<any>,
  I extends (
    ...args: any
  ) => A extends SafeInjectionToken<any>
    ? SafeInjectionTokenType<A>
    : A extends AbstractConstructor<any>
      ? InstanceType<A>
      : never,
  D extends MapParametersToDeps<FunctionOrConstructorParameters<I>>,
> = {
  provide: A;
  useFactory: I;
  deps: D;
};

/**
 * Represents a dependency provided with the useExisting option.
 */
type SafeExistingProvider<
  A extends Constructor<any> | AbstractConstructor<any>,
  I extends Constructor<InstanceType<A>> | AbstractConstructor<InstanceType<A>>,
> = {
  provide: A;
  useExisting: I;
};

/**
 * A factory function that creates a provider for the ngModule providers array.
 * This guarantees type safety for your provider definition. It does nothing at runtime.
 * @param provider Your provider object in the usual shape (e.g. using useClass, useValue, useFactory, etc.)
 * @returns The exact same object without modification (pass-through).
 */
export const safeProvider = <
  AClass extends AbstractConstructor<any>,
  IClass extends Constructor<InstanceType<AClass>>,
  DClass extends MapParametersToDeps<ConstructorParameters<IClass>>,
  AValue extends SafeInjectionToken<any>,
  VValue extends SafeInjectionTokenType<AValue>,
  AFactory extends SafeInjectionToken<any> | AbstractConstructor<any>,
  IFactory extends (
    ...args: any
  ) => AFactory extends SafeInjectionToken<any>
    ? SafeInjectionTokenType<AFactory>
    : AFactory extends AbstractConstructor<any>
      ? InstanceType<AFactory>
      : never,
  DFactory extends MapParametersToDeps<FunctionOrConstructorParameters<IFactory>>,
  AExisting extends Constructor<any> | AbstractConstructor<any>,
  IExisting extends
    | Constructor<InstanceType<AExisting>>
    | AbstractConstructor<InstanceType<AExisting>>,
>(
  provider:
    | SafeClassProvider<AClass, IClass, DClass>
    | SafeValueProvider<AValue, VValue>
    | SafeFactoryProvider<AFactory, IFactory, DFactory>
    | SafeExistingProvider<AExisting, IExisting>
    | Constructor<unknown>,
): SafeProvider => provider as SafeProvider;

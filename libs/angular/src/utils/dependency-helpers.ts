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
 * Register a dependency in the providers array using the useValue option.
 * Guarantees that the values are type safe, e.g. the value type matches the InjectionToken type.
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
 * Register a dependency in the providers array using the useFactory option.
 * Guarantees that the values are type safe, e.g. you have correctly specified the deps for your function.
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
 * Register a dependency in the providers array using the useExisting option.
 * Provides only limited type safety, be careful.
 * @remarks This is not fully type safe because we often use this to register for "Internal" variants where the
 * developer knows that the existing definition implements an extended interface, but this is not discoverable via the
 * type system.
 */
type SafeExistingProvider<
  A extends Constructor<any> | AbstractConstructor<any>,
  I extends Constructor<Partial<InstanceType<A>>> | AbstractConstructor<Partial<InstanceType<A>>>,
> = {
  provide: A;
  useExisting: I;
};

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
    | Constructor<Partial<InstanceType<AExisting>>>
    | AbstractConstructor<Partial<InstanceType<AExisting>>>,
>(
  provider:
    | SafeClassProvider<AClass, IClass, DClass>
    | SafeValueProvider<AValue, VValue>
    | SafeFactoryProvider<AFactory, IFactory, DFactory>
    | SafeExistingProvider<AExisting, IExisting>
    | Constructor<unknown>,
): SafeProvider => provider as SafeProvider;

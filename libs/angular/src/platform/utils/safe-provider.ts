import { Provider } from "@angular/core";
import { Constructor, Opaque } from "type-fest";

import { SafeInjectionToken } from "../../services/injection-tokens";

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
type SafeClassProviderWithClass<
  A extends AbstractConstructor<any>,
  I extends Constructor<InstanceType<A>>,
  D extends MapParametersToDeps<ConstructorParameters<I>>,
> = {
  provide: A;
  useClass: I;
  deps: D;
};

/**
 * Represents a dependency provided with the useClass option.
 */
type SafeClassProviderWithToken<
  A extends SafeInjectionToken<any>,
  I extends Constructor<InstanceType<SafeInjectionTokenType<A>>>,
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

/**
 * Represents a dependency provided with the useFactory option where a SafeInjectionToken is used as the token.
 */
type SafeFactoryProviderWithToken<
  A extends SafeInjectionToken<any>,
  I extends (...args: any) => InstanceType<SafeInjectionTokenType<A>>,
  D extends MapParametersToDeps<Parameters<I>>,
> = {
  provide: A;
  useFactory: I;
  deps: D;
  multi?: boolean;
};

/**
 * Represents a dependency provided with the useFactory option where an abstract class is used as the token.
 */
type SafeFactoryProviderWithClass<
  A extends AbstractConstructor<any>,
  I extends (...args: any) => InstanceType<A>,
  D extends MapParametersToDeps<Parameters<I>>,
> = {
  provide: A;
  useFactory: I;
  deps: D;
};

/**
 * Represents a dependency provided with the useExisting option.
 */
type SafeExistingProviderWithClass<
  A extends Constructor<any> | AbstractConstructor<any>,
  I extends Constructor<InstanceType<A>> | AbstractConstructor<InstanceType<A>>,
> = {
  provide: A;
  useExisting: I;
};

/**
 * Represents a dependency provided with the useExisting option.
 */
type SafeExistingProviderWithToken<
  A extends SafeInjectionToken<any>,
  I extends
    | Constructor<InstanceType<SafeInjectionTokenType<A>>>
    | AbstractConstructor<InstanceType<SafeInjectionTokenType<A>>>,
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
  // types for useClass with Class
  AClassClass extends AbstractConstructor<any>,
  IClassClass extends Constructor<InstanceType<AClassClass>>,
  DClassClass extends MapParametersToDeps<ConstructorParameters<IClassClass>>,
  // types for useClass with Token
  AClassToken extends SafeInjectionToken<any>,
  IClassToken extends Constructor<InstanceType<SafeInjectionTokenType<AClassToken>>>,
  DClassToken extends MapParametersToDeps<ConstructorParameters<IClassToken>>,
  // types for useValue
  AValue extends SafeInjectionToken<any>,
  VValue extends SafeInjectionTokenType<AValue>,
  // types for useFactoryWithToken
  AFactoryToken extends SafeInjectionToken<any>,
  IFactoryToken extends (...args: any) => InstanceType<SafeInjectionTokenType<AFactoryToken>>,
  DFactoryToken extends MapParametersToDeps<Parameters<IFactoryToken>>,
  // types for useFactoryWithClass
  AFactoryClass extends AbstractConstructor<any>,
  IFactoryClass extends (...args: any) => InstanceType<AFactoryClass>,
  DFactoryClass extends MapParametersToDeps<Parameters<IFactoryClass>>,
  // types for useExistingWithClass
  AExistingClass extends Constructor<any> | AbstractConstructor<any>,
  IExistingClass extends
    | Constructor<InstanceType<AExistingClass>>
    | AbstractConstructor<InstanceType<AExistingClass>>,
  // types for useExistingWithToken
  AExistingToken extends SafeInjectionToken<any>,
  IExistingToken extends
    | Constructor<InstanceType<SafeInjectionTokenType<AExistingToken>>>
    | AbstractConstructor<InstanceType<SafeInjectionTokenType<AExistingToken>>>,
>(
  provider:
    | SafeClassProviderWithClass<AClassClass, IClassClass, DClassClass>
    | SafeClassProviderWithToken<AClassToken, IClassToken, DClassToken>
    | SafeValueProvider<AValue, VValue>
    | SafeFactoryProviderWithToken<AFactoryToken, IFactoryToken, DFactoryToken>
    | SafeFactoryProviderWithClass<AFactoryClass, IFactoryClass, DFactoryClass>
    | SafeExistingProviderWithClass<AExistingClass, IExistingClass>
    | SafeExistingProviderWithToken<AExistingToken, IExistingToken>
    | Constructor<unknown>,
): SafeProvider => provider as SafeProvider;

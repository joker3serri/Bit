import { SafeInjectionToken } from "../services/injection-tokens";

/**
 * Given a type, return a constructor that returns that type
 * This is used to resolve mismatches between types (generally representing an instantiated class) and constructor types (the non-instantiated class)
 */
type ConstructorForType<T> = abstract new (...args: any) => T;

type MapParametersToDeps<T> = {
  [K in keyof T]: ConstructorForType<T[K]> | SafeInjectionToken<T[K]>;
};

export const useClass = <
  A extends abstract new (...args: any) => InstanceType<A>, // A is an abstract class
  I extends new (...args: any) => InstanceType<A>, // I is the implementation, it has a non-abstract ctor that returns a type that extends A
  D extends MapParametersToDeps<ConstructorParameters<I>>, // accept an array of constructor types OR injection tokens matching ctor parameters
>(obj: {
  provide: A;
  useClass: I;
  deps: D;
}) => obj;

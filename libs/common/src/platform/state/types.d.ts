declare const marker: unique symbol;
type StorageKey = string & { [marker]: "StorageKey" };

/**
 * A helper type defining Constructor types for javascript and `typeof T` types for Typescript
 */
type Type<T> = abstract new (...args: any[]) => T;

/**
 * Converts an object of types to an object of instances
 */
type ShapeToInstances<T> = {
  [P in keyof T]: T[P] extends Type<infer R> ? R : never;
};

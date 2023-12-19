declare const marker: unique symbol;
type StorageKey = string & { [marker]: "StorageKey" };

type Type<T> = abstract new (...args: any[]) => T;

type ShapeToInstances<T> = {
  [P in keyof T]: T[P] extends Type<infer R> ? R : never;
};

import { PositiveInfinity, NegativeInfinity, JsonPrimitive, TypedArray } from "type-fest";

/**
 * Represents a type that can be safely serialized using JSON.stringify without data loss.
 * Adapted from type-fest's jsonify type for our own needs
 * Compare to https://github.com/sindresorhus/type-fest/blob/main/source/jsonify.d.ts
 * @example
 * myClass {
 *  toJSON(): ToJson<MyClass> { ... }
 * }
 */
export type ToJson<T> = {
  [K in keyof T]?: ToJsonProperty<T[K]>;
};

type ToJsonProperty<T> =
  // Check if there are any non-JSONable types represented in the union.
  // Note: The use of tuples in this first condition side-steps distributive conditional types
  // (see https://github.com/microsoft/TypeScript/issues/29368#issuecomment-453529532)
  T extends PositiveInfinity | NegativeInfinity
    ? null
    : // Primitives are acceptable
    T extends JsonPrimitive
    ? T
    : // JSON.stringify automatically converts Dates to an ISO string, so this is acceptable
    T extends Date
    ? Date
    : // Maps should be converted to objects
    T extends Map<any, any>
    ? Record<any, any>
    : // Sets should be converted to arrays
    T extends Set<any>
    ? Array<any>
    : // TypedArrays and ArrayBuffers should be converted to B64
    T extends TypedArray | ArrayBuffer
    ? string
    : // For arrays, recursively call this type for its children
    T extends Array<infer U>
    ? Array<ToJsonProperty<U>>
    : // Nested objects that implement their own toJSON method (preferably by implementing Storable<T>) will be handled
    // automatically
    T extends { toJSON: () => ToJson<T> }
    ? T
    : // Methods are ignored by JSON.stringify, but we need to allow them here so we can return `this` from toJSON()
    T extends (...args: any) => any
    ? (...args: any) => any
    : // It's none of the above, we can't safely handle it so it shouldn't be used
      never;

/**
 * Represents the ToJson type after it's been serialized & deserialized again.
 * The main difference is that Dates are automatically converted to strings by JSON.stringify,
 * but are not converted back by JSON.parse.
 * @example
 * jsonObject: FromJson<T> = JSON.parse(JSON.stringify(myClass));
 */
export type FromJson<T> = {
  [K in keyof T]?: FromJsonProperty<T[K]>;
};

type FromJsonProperty<T> =
  // Check if there are any non-JSONable types represented in the union.
  // Note: The use of tuples in this first condition side-steps distributive conditional types
  // (see https://github.com/microsoft/TypeScript/issues/29368#issuecomment-453529532)
  T extends PositiveInfinity | NegativeInfinity
    ? null
    : // Primitives are acceptable
    T extends JsonPrimitive
    ? T
    : // JSON.stringify automatically converts Dates to an ISO string
    T extends Date
    ? string
    : // Maps should be converted to objects
    T extends Map<any, any>
    ? Record<any, any>
    : // Sets should be converted to arrays
    T extends Set<any>
    ? Array<any>
    : // TypedArrays and ArrayBuffers should be converted to B64
    T extends TypedArray | ArrayBuffer
    ? string
    : // For arrays, recursively call this type for its children
    T extends Array<infer U>
    ? Array<FromJsonProperty<U>>
    : // Nested objects that implement their own toJSON method (preferably by implementing Storable<T>)
    T extends { toJSON: () => ToJson<T> }
    ? FromJson<T>
    : // It's none of the above, we can't safely handle it so it shouldn't be used
      never;

import { PositiveInfinity, NegativeInfinity, JsonPrimitive, TypedArray } from "type-fest";

/**
 * Represents a type that can be safely serialized using JSON.stringify without data loss.
 * Adapted from type-fest's jsonify type, but avoids circular references to the toJSON() return type.
 * Refer to https://github.com/sindresorhus/type-fest/blob/main/source/jsonify.d.ts
 * Also fixes eslint error 'ban-types' which prohibits use of '{}' as a type.
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
    : T extends JsonPrimitive
    ? T // Primitive is acceptable
    : T extends number
    ? number
    : T extends string
    ? string
    : T extends boolean
    ? boolean
    : T extends Date
    ? Date // JSON.stringify automatically converts Dates to an ISO string, so this is acceptable
    : T extends Map<any, any>
    ? Record<any, any>
    : T extends Set<any>
    ? Array<any>
    : T extends TypedArray
    ? Record<string, number>
    : T extends Array<infer U>
    ? Array<ToJsonProperty<U>> // It's an array: recursive call for its children
    : T extends object
    ? ToJson<T> // It's a nested object
    : never; // Otherwise any other non-object is removed

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
    : T extends JsonPrimitive
    ? T // Primitive is acceptable
    : T extends number
    ? number
    : T extends string
    ? string
    : T extends boolean
    ? boolean
    : T extends Date
    ? string // Dates should be stored as ISO strings
    : T extends Map<any, any>
    ? Record<any, any>
    : T extends Set<any>
    ? Array<any>
    : T extends TypedArray
    ? Record<string, number>
    : T extends Array<infer U>
    ? Array<FromJsonProperty<U>> // It's an array: recursive call for its children
    : T extends object
    ? FromJson<T> // It's a nested object
    : never; // Otherwise any other non-object is removed

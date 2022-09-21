import {
  PositiveInfinity,
  NegativeInfinity,
  JsonPrimitive,
  TypedArray,
  JsonValue,
} from "type-fest";
import { NotJsonable } from "type-fest/source/jsonify";

/**
 * Extracted from type-fest `Jsonify` and extended with Jsonification of objects returned from `toJSON` methods.
 */
export type DeepJsonify<T> =
  // Check if there are any non-JSONable types represented in the union.
  // Note: The use of tuples in this first condition side-steps distributive conditional types
  // (see https://github.com/microsoft/TypeScript/issues/29368#issuecomment-453529532)
  [Extract<T, NotJsonable | bigint>] extends [never]
    ? T extends PositiveInfinity | NegativeInfinity
      ? null
      : T extends JsonPrimitive
      ? T // Primitive is acceptable
      : T extends number
      ? number
      : T extends string
      ? string
      : T extends boolean
      ? boolean
      : T extends Map<any, any> | Set<any>
      ? Record<string, never>
      : T extends TypedArray
      ? Record<string, number>
      : T extends Array<infer U>
      ? Array<DeepJsonify<U extends NotJsonable ? null : U>> // It's an array: recursive call for its children
      : T extends object
      ? T extends { toJSON(): infer J }
        ? (() => J) extends () => JsonValue // Is J assignable to JsonValue?
          ? J // Then T is Jsonable and its Jsonable value is J
          : {
              [P in keyof T as P extends symbol
                ? never
                : T[P] extends NotJsonable
                ? never
                : P]: DeepJsonify<Required<T>[P]>;
            } // toJSON() returns an object that is not a JsonValue but might still be Jsonable: recursive call for its children
        : {
            [P in keyof T as P extends symbol
              ? never
              : T[P] extends NotJsonable
              ? never
              : P]: DeepJsonify<Required<T>[P]>;
          } // It's an object: recursive call for its children
      : never // Otherwise any other non-object is removed
    : never; // Otherwise non-JSONable type union was found not empty

/**
 * This class MUST be inherited by any class that can be safely serialized and deserialized.
 * You must also implement a static fromJSON method - see the example interface below
 * (unfortunately we can't enforce static methods from an abstract class)
 */
export abstract class Storable<T extends object> {
  /**
   * This method will be called by JSON.stringify() and should return an object that can be safely serialized.
   * You will need to consider whether the default behaviour of JSON.stringify is suitable for your class.
   * If no custom logic is required, you can just return `this` to rely on the default behaviour.
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
   */
  abstract toJSON(): ToJsonObject<T>;

  // You should also implement a static method to initialize a new object:
  // static fromJSON(obj: ParsedObject<MyClass>): MyClass;
}

/**
 * An object that can be serialized using JSON.stringify() without data loss. Returned by toJSON()
 */
export type ToJsonObject<T extends object> = {
  [K in keyof T]?: T[K] extends SerializablePrimitives | SerializablePrimitives[]
    ? T[K]
    : T[K] extends Array<any>
    ? any[]
    : any;
};
type SerializablePrimitives = number | string | boolean | Date;

/**
 * An object returned by JSON.parse() before it's reinitialized as a class instance by fromJSON
 */
export type ParsedObject<T extends object> = {
  [K in keyof T]?: T[K] extends DeserializablePrimitives | DeserializablePrimitives[]
    ? T[K]
    : T[K] extends Date
    ? string
    : T[K] extends Array<any>
    ? any[]
    : any;
};
type DeserializablePrimitives = number | string | boolean;

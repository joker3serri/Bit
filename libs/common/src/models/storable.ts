/**
 * This class MUST be inherited by any class that can be safely serialized and deserialized.
 * You must also implement a static fromJSON method - see the example interface below
 * (Ideally, fromJSON should be required by this abstract class, but you cannot have abstract static methods.)
 */
export abstract class Storable<T extends object> {
  /**
   * This method will be called by JSON.stringify() and should return an object that can be safely serialized.
   * You will need to consider whether the default behaviour of JSON.stringify is suitable for your class.
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
   * If no custom logic is required, you can just return `this` to rely on the default behaviour.
   */
  abstract toJSON(): StringifyObject<T>;

  // You should also implement a static method to initialize a new object:
  // static fromJSON(obj: ParsedObject<T>): T;
}

/**
 * An object that can be serialized using JSON.stringify() without data loss. Returned by toJSON()
 */
export type StringifyObject<T extends object> = {
  [K in keyof T]?: T[K] extends SerializablePrimitives | SerializablePrimitives[]
    ? T[K]
    : T[K] extends Array<any>
    ? any[]
    : any;
};
type SerializablePrimitives = DeserializablePrimitives | Date;

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

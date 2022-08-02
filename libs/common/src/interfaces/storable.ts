import { ToJson } from "../types/json.types";
/**
 * This class MUST be inherited by any class that can be safely serialized and deserialized.
 * You must also implement a static fromJSON method - see the example interface below
 * (unfortunately we can't enforce static methods from an abstract class)
 */
export interface Storable<T extends object> {
  /**
   * This method will be called by JSON.stringify() and should return an object that can be safely serialized.
   * You will need to consider whether the default behaviour of JSON.stringify is suitable for your class.
   * If no custom logic is required, you can just return `this` to rely on the default behaviour.
   * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
   */
  toJSON(): ToJson<T>;

  // You should also implement a static method to initialize a new object:
  // static fromJSON(obj: FromJson<MyClass>): MyClass;
}

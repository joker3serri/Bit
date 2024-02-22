import { Jsonify } from "type-fest";

/**
 *
 * @param elementDeserializer
 * @returns
 */
export const array = <T>(elementDeserializer: (element: Jsonify<T>) => T) => {
  return (array: Jsonify<T | null>[]) => {
    if (array == null) {
      return null;
    }

    return array.map((element) => elementDeserializer(element));
  };
};

/**
 *
 * @param valueDeserializer
 */
export const record = <T, TKey extends string = string>(
  valueDeserializer: (value: Jsonify<T>) => T,
) => {
  return (jsonValue: Jsonify<Record<TKey, T> | null>) => {
    if (jsonValue == null) {
      return null;
    }

    const output: Record<string, T> = {};
    for (const key in jsonValue) {
      output[key] = valueDeserializer((jsonValue as Record<string, Jsonify<T>>)[key]);
    }
    return output;
  };
};

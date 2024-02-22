import { Jsonify } from "type-fest";

/** Classifies an object's JSON-serializable data by property into
 *  3 categories:
 *  * Disclosed data MAY be stored in plaintext.
 *  * Excluded data MUST NOT be saved.
 *  * The remaining data is secret and MUST be stored using encryption.
 *
 *  This type should not be used to classify functions.
 *  Data that cannot be serialized by JSON.stringify() should
 *  be excluded.
 */
export class SecretClassifier<T extends Jsonify<object>, Disclosed, Secret> {
  private constructor(
    disclosed: readonly (keyof Jsonify<Disclosed> & keyof T)[],
    excluded: readonly (keyof T)[],
  ) {
    this.disclosed = disclosed;
    this.excluded = excluded;
  }

  /** lists the disclosed properties. */
  readonly disclosed: readonly (keyof Jsonify<Disclosed> & keyof T)[];

  /** lists the excluded properties. */
  readonly excluded: readonly (keyof T)[];

  /** Creates a classifier where all properties are secret.
   *  @type {T} The type of secret being classified.
   */
  static allSecret<T extends Jsonify<object>>() {
    const disclosed = Object.freeze([]);
    const excluded = Object.freeze([]);
    return new SecretClassifier<T, Record<keyof T, never>, T>(disclosed, excluded);
  }

  /** Classify a property as disclosed.
   *  @type {PropertyName} Available secrets to disclose.
   *  @param disclose The property name to disclose.
   *  @returns a new classifier
   */
  disclose<const PropertyName extends keyof Secret>(disclose: PropertyName) {
    // move the property from the secret type to the disclose type
    type NewDisclosed = Disclosed & Record<PropertyName, Secret[PropertyName]>;
    type NewSecret = Exclude<Secret, PropertyName>;

    // update the fluent interface
    const newDisclosed = [...this.disclosed, disclose] as (keyof NewDisclosed & keyof T)[];
    const classifier = new SecretClassifier<T, NewDisclosed, NewSecret>(
      // since `NewDisclosed` is opaque to the type checker, it's necessary
      // to assert the type of the array here.
      Object.freeze(newDisclosed) as (keyof Jsonify<NewDisclosed> & keyof T)[],
      this.excluded,
    );

    return classifier;
  }

  /** Classify a property as excluded.
   *  @type {PropertyName} Available secrets to exclude.
   *  @param exclude The property name to exclude.
   *  @returns a new classifier
   */
  exclude<const PropertyName extends keyof Secret>(excludedPropertyName: PropertyName) {
    // remove the property from the secret type
    type NewConfidential = Exclude<Secret, PropertyName>;

    // update the fluent interface
    const newExcluded = [...this.excluded, excludedPropertyName] as (keyof T)[];
    const classifier = new SecretClassifier<T, Disclosed, NewConfidential>(
      this.disclosed,
      Object.freeze(newExcluded),
    );

    return classifier;
  }

  /** Partitions `secret` into its disclosed properties and secret properties.
   *  @param secret The object to partition
   *  @returns an object that classifies secrets.
   *    The `disclosed` member is new and contains disclosed properties.
   *    The `secret` member aliases the secret parameter, with all
   *    disclosed and excluded properties deleted.
   */
  classify(secret: T): { disclosed: Jsonify<Disclosed>; secret: Secret } {
    const copy = { ...secret };

    for (const excludedProp of this.excluded) {
      delete copy[excludedProp];
    }

    const disclosed: Record<PropertyKey, unknown> = {};
    for (const disclosedProp of this.disclosed) {
      disclosed[disclosedProp] = copy[disclosedProp];
      delete copy[disclosedProp];
    }

    return {
      disclosed: disclosed as Jsonify<Disclosed>,
      secret: copy as unknown as Secret,
    };
  }

  /** Merges the properties of `secret` and `disclosed`. When `secret` and
   *  `disclosed` contain the same property, the `secret` property overrides
   *  the `disclosed` property.
   *  @param disclosed an object whose disclosed properties are merged into
   *    the output. Unknown properties are ignored.
   *  @param secret an objects whose properties are merged into the output.
   *    Excluded properties are ignored. Unknown properties are retained.
   *  @returns a new object containing the merged data.
   */
  declassify(disclosed: Jsonify<Disclosed>, secret: Jsonify<Secret>): Jsonify<T> {
    // removed unknown keys from `disclosed` to prevent any old edit
    // of plaintext data from being laundered though declassification.
    const cleaned = {} as Partial<Jsonify<Disclosed>>;
    for (const disclosedProp of this.disclosed) {
      cleaned[disclosedProp] = disclosed[disclosedProp];
    }

    // merge decrypted into cleaned so that secret data clobbers public data
    const merged: any = Object.assign(cleaned, secret);

    // delete excluded props
    for (const excludedProp of this.excluded) {
      delete merged[excludedProp];
    }

    return merged as Jsonify<T>;
  }
}

import { Jsonify } from "type-fest";

/** Classifies the properties of a secret. Disclosed secrets
 *  MAY be stored in plaintext. Excluded secrets MUST NOT be
 *  saved. Everything else MUST be stored using encryption.
 */
export class SecretClassifier<T extends object, Disclosed, Secret> {
  private constructor(
    disclosed: readonly (keyof Disclosed & keyof T)[],
    excluded: readonly (keyof T)[],
  ) {
    this.disclosed = disclosed;
    this.excluded = excluded;
  }

  /** lists the disclosed properties. */
  readonly disclosed: readonly (keyof Disclosed & keyof T)[];

  /** lists the excluded properties. */
  readonly excluded: readonly (keyof T)[];

  /** Creates a classifier where all properties are secret.
   *  @type {T} The type of secret being classified.
   */
  static forSecret<T extends object>() {
    const disclosed = Object.freeze([]);
    const excluded = Object.freeze([]);
    return new SecretClassifier<T, Record<keyof T, never>, T>(disclosed, excluded);
  }

  /** Classify a property as disclosed.
   *  @type {PropertyName} Available secrets to disclose.
   *  @param disclose The property name to disclose.
   *  @returns a new classifier
   */
  // FIXME: when Typescript 5.0 is available, PropertyName can be `const`.
  disclose<PropertyName extends keyof Secret>(disclose: PropertyName) {
    // move the property from the secret type to the disclose type
    type NewDisclosed = Disclosed & Record<PropertyName, Secret[PropertyName]>;
    type NewSecret = Exclude<Secret, PropertyName>;

    // update the fluent interface
    const newDisclosed = [...this.disclosed, disclose] as (keyof NewDisclosed & keyof T)[];
    const classifier = new SecretClassifier<T, NewDisclosed, NewSecret>(
      Object.freeze(newDisclosed),
      this.excluded,
    );

    return classifier;
  }

  /** Classify a property as excluded.
   *  @type {PropertyName} Available secrets to exclude.
   *  @param exclude The property name to exclude.
   *  @returns a new classifier
   */
  // FIXME: when Typescript 5.0 is available, PropertyName can be `const`.
  exclude<PropertyName extends keyof Secret>(excludedPropertyName: PropertyName) {
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
   *  THIS METHOD ALTERS `secret`.
   *  @param secret The object to partition
   *  @returns an object that classifies secrets.
   *    The `disclosed` member is new and contains disclosed properties.
   *    The `secret` member aliases the secret parameter, with all
   *    disclosed and excluded properties deleted.
   */
  classify(secret: T): { disclosed: Disclosed; secret: Secret } {
    for (const excludedProp of this.excluded) {
      delete secret[excludedProp];
    }

    const disclosed: Record<PropertyKey, unknown> = {};
    for (const disclosedProp of this.disclosed) {
      disclosed[disclosedProp] = secret[disclosedProp];
      delete secret[disclosedProp];
    }

    return {
      disclosed: disclosed as Disclosed,
      secret: secret as unknown as Secret,
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
  declassify(disclosed: Disclosed, secret: Secret): Jsonify<T> {
    // removed unknown keys from `disclosed` to prevent any old edit
    // of plaintext data from being laundered though declassification.
    const cleaned = {} as Partial<Disclosed>;
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

import { Jsonify } from "type-fest";

/** Classifies the properties of a secret. Disclosed secrets
 *  MAY be stored in plaintext. Excluded secrets MUST NOT be
 *  saved. Everything else MUST be stored using encryption.
 */
export class SecretClassifier<T extends object, Disclosed, Secret> {
  /** Instantiates a secret classifier.
   *  @param disclosed lists disclosed properties of `T`.
   *  @param excluded lists excluded of `T`.
   *  @remarks You should probably be using {@link SecretClassifier.forSecret}.
   */
  constructor(
    private readonly disclosed: (keyof Disclosed & keyof T)[],
    private readonly excluded: (keyof T)[],
  ) {
    Object.freeze(disclosed);
    Object.freeze(excluded);
  }

  /** Creates a classifier where all properties are secret.
   *  @type {T} The type of secret being classified.
   */
  static forSecret<T extends object>() {
    return new SecretClassifier<T, Record<keyof T, never>, T>([], []);
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
      newDisclosed,
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
      newExcluded,
    );

    return classifier;
  }

  /** Partitions `secret` into its disclosed properties and secret properties.
   *  THIS METHOD ALTERS `secret`.
   *  @type {T} the type subject to classification.
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
      delete secret[disclosedProp];
      disclosed[disclosedProp] = secret[disclosedProp];
    }

    return {
      disclosed: disclosed as Disclosed,
      secret: secret as unknown as Secret,
    };
  }

  declassify(disclosed: Disclosed, secret: Secret): Jsonify<T> {
    // removed unknown keys from `disclosed` to prevent any old edit
    // of plaintext data from being laundered though declassification.
    const cleaned = {} as Partial<Disclosed>;
    for (const disclosedProp of this.disclosed) {
      cleaned[disclosedProp] = disclosed[disclosedProp];
    }

    // merge decrypted into cleaned so that secret data clobbers public data
    const merged = Object.assign(cleaned, secret) as Jsonify<T>;
    return merged;
  }
}

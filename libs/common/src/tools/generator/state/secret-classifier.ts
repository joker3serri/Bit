import { Jsonify } from "type-fest";

/** Classifies the properties of a secret. Exposed secrets
 *  MAY be stored in plaintext. Excluded secrets MUST NOT be
 *  saved. Everything else MUST be stored using encryption.
 */
export class SecretClassifier<T extends object, Exposed, Secret> {
  /** Instantiates a secret classifier.
   *  @param exposed lists exposed properties of `T`.
   *  @param excluded lists excluded of `T`.
   *  @remarks You should probably be using {@link SecretClassifier.forSecret}.
   */
  constructor(
    private exposed: (keyof Exposed & keyof T)[],
    private excluded: (keyof T)[],
  ) {}

  /** Creates a classifier where all properties are secret.
   *  @type {T} The type of secret being classified.
   */
  static forSecret<T extends object>() {
    return new SecretClassifier<T, Record<keyof T, never>, T>([], []);
  }

  /** Classify a property as exposed.
   *  @type {PropertyName} Available secrets to expose.
   *  @param exposed The property name to expose.
   *  @returns a new classifier
   */
  // FIXME: when Typescript 5.0 is available, PropertyName can be `const`.
  expose<PropertyName extends keyof Secret>(exposed: PropertyName) {
    // move the property from the secret type to the exposed type
    type NewExposed = Exposed & Record<PropertyName, Secret[PropertyName]>;
    type NewSecret = Exclude<Secret, PropertyName>;

    // update the fluent interface
    const newExposed = [...this.exposed, exposed] as (keyof NewExposed & keyof T)[];
    const classifier = new SecretClassifier<T, NewExposed, NewSecret>(newExposed, this.excluded);

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
    const classifier = new SecretClassifier<T, Exposed, NewConfidential>(this.exposed, newExcluded);

    return classifier;
  }

  /** Partitions `secret` into its exposed properties and secret properties.
   *  THIS METHOD ALTERS `secret`.
   *  @type {T} the type subject to classification.
   *  @param secret The object to partition
   *  @returns an object that classifies secrets.
   *    The `exposed` member is new and contains exposed properties.
   *    The `secret` member aliases the secret parameter, with all
   *    exposed and excluded properties deleted.
   */
  classify(secret: T): { exposed: Exposed; secret: Secret } {
    for (const excludedProp of this.excluded) {
      delete secret[excludedProp];
    }

    const exposed: Record<PropertyKey, unknown> = {};
    for (const exposedProp of this.exposed) {
      delete secret[exposedProp];
      exposed[exposedProp] = secret[exposedProp];
    }

    return {
      exposed: exposed as Exposed,
      secret: secret as unknown as Secret,
    };
  }

  declassify(exposed: Exposed, secret: Secret): Jsonify<T> {
    // removed unexposed keys from `jsonValue to prevent any old edit
    // of plaintext data from being laundered though declassification.
    const cleaned = {} as Partial<Exposed>;
    for (const exposedProp of this.exposed) {
      cleaned[exposedProp] = exposed[exposedProp];
    }

    // merge decrypted into cleaned so that secret data clobbers public data
    const merged = Object.assign(cleaned, secret) as Jsonify<T>;
    return merged;
  }
}

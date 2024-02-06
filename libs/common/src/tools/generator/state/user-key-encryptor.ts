import { Jsonify } from "type-fest";

import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { UserId } from "../../../types/guid";

import { SecretClassifier } from "./secret-classifier";

/** Padding values used to prevent leaking the length of the encrypted options. */
const SecretPadding = Object.freeze({
  /** The length to pad out encrypted members. This should be at least as long
   *  as the JSON content for the longest JSON payload being encrypted.
   */
  length: 4096,

  /** The character to use for padding. */
  character: "0",

  /** A regular expression for detecting invalid padding. When the character
   *  changes, this should be updated to include the new padding pattern.
   */
  hasInvalidPadding: /[^0]/,
});

/** A classification strategy that protects a type's secrets by encrypting them
 *  with a `UserKey`
 */
export class UserKeyEncryptor<State extends object, Disclosed, Secret> {
  /** Instantiates the encryptor
   *  @param encryptService protects properties of `Secret`.
   *  @param keyService looks up the user key when protecting data.
   *  @param classifier partitions secrets and disclosed information.
   */
  constructor(
    private readonly encryptService: EncryptService,
    private readonly keyService: CryptoService,
    private readonly classifier: SecretClassifier<State, Disclosed, Secret>,
  ) {}

  /** Protects secrets in `value` using the user's key.
   *  @param value the object to protect. This object is mutated during encryption.
   */
  async encrypt(value: State, userId: UserId): Promise<[EncString, Disclosed]> {
    const classifiedValue = this.classifier.classify(value);
    const encryptedValue = await this.encryptSecret(classifiedValue.secret, userId);
    return [encryptedValue, classifiedValue.disclosed];
  }

  /** Combines protected secrets and disclosed data into a type that can be
   *  rehydrated into a domain object.
   *  @param secret the object to protect. This object is mutated during encryption.
   */
  async decrypt(secret: EncString, disclosed: Disclosed, userId: UserId): Promise<Jsonify<State>> {
    // reconstruct TFrom's data
    const decrypted = await this.decryptSecret(secret, userId);
    const jsonValue = this.classifier.declassify(disclosed, decrypted);

    return jsonValue;
  }

  private async encryptSecret(value: Secret, userId: UserId) {
    // package the data for encryption
    const json = JSON.stringify(value);

    // conceal the length of the encrypted data
    const toEncrypt = json.padEnd(
      SecretPadding.length - (json.length % SecretPadding.length),
      SecretPadding.character,
    );

    // encrypt the data and drop the key for GC
    let key = await this.keyService.getUserKey(userId);
    const encrypted = await this.encryptService.encrypt(toEncrypt, key);
    key = null;

    return encrypted;
  }

  // There may be a need to use SUBTLE here.
  private async decryptSecret(value: EncString, userId: UserId): Promise<Secret> {
    // decrypt the data and drop the key for GC
    let key = await this.keyService.getUserKey(userId);
    const decrypted = await this.encryptService.decryptToUtf8(value, key);
    key = null;

    // If the decrypted string is not exactly the padding length, it could be compromised
    // and shouldn't be trusted.
    if (decrypted.length % SecretPadding.length > 0) {
      throw new Error("invalid length");
    }

    // JSON terminates with a closing brace, after which the plaintext repeats `character`
    // If the closing brace is not found, then it could be compromised and shouldn't be trusted.
    const jsonBreakpoint = decrypted.lastIndexOf("}") + 1;
    if (jsonBreakpoint < 1) {
      throw new Error("missing json object");
    }

    // If the padding contains invalid padding characters then the padding could be used
    // as a side channel for arbitrary data.
    if (decrypted.substring(jsonBreakpoint).match(SecretPadding.hasInvalidPadding)) {
      throw new Error("invalid padding");
    }

    // remove padding
    const unpacked = decrypted.substring(0, jsonBreakpoint);
    const parsed = JSON.parse(unpacked);

    return parsed;
  }
}

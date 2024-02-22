import { Jsonify } from "type-fest";

import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { UserId } from "../../../types/guid";

import { DataPacker } from "./data-packer.abstraction";
import { SecretClassifier } from "./secret-classifier";
import { UserEncryptor } from "./user-encryptor.abstraction";

/** A classification strategy that protects a type's secrets by encrypting them
 *  with a `UserKey`
 */
export class UserKeyEncryptor<State extends object, Disclosed, Secret> extends UserEncryptor<
  State,
  Disclosed
> {
  /** Instantiates the encryptor
   *  @param encryptService protects properties of `Secret`.
   *  @param keyService looks up the user key when protecting data.
   *  @param classifier partitions secrets and disclosed information.
   *  @param dataPacker packs and unpacks data classified as secrets.
   */
  constructor(
    private readonly encryptService: EncryptService,
    private readonly keyService: CryptoService,
    private readonly classifier: SecretClassifier<State, Disclosed, Secret>,
    private readonly dataPacker: DataPacker,
  ) {
    super();
  }

  /** {@link UserEncryptor.encrypt} */
  async encrypt(value: State, userId: UserId): Promise<[EncString, Jsonify<Disclosed>]> {
    this.assertHasValue("value", value);
    this.assertHasValue("userId", userId);

    const classifiedValue = this.classifier.classify(value);
    const encryptedValue = await this.encryptSecret(classifiedValue.secret, userId);
    return [encryptedValue, classifiedValue.disclosed];
  }

  /** {@link UserEncryptor.decrypt} */
  async decrypt(
    secret: EncString,
    disclosed: Jsonify<Disclosed>,
    userId: UserId,
  ): Promise<Jsonify<State>> {
    this.assertHasValue("secret", secret);
    this.assertHasValue("disclosed", disclosed);
    this.assertHasValue("userId", userId);

    // reconstruct TFrom's data
    const decrypted = await this.decryptSecret(secret, userId);
    const jsonValue = this.classifier.declassify(disclosed, decrypted);

    return jsonValue;
  }

  private assertHasValue(name: string, value: any) {
    if (value === undefined || value === null) {
      throw new Error(`${name} cannot be null or undefined`);
    }
  }

  private async encryptSecret(value: Secret, userId: UserId) {
    // package the data for encryption
    let toEncrypt = this.dataPacker.pack(value);

    // encrypt the data and drop the key
    let key = await this.keyService.getUserKey(userId);
    const encrypted = await this.encryptService.encrypt(toEncrypt, key);
    toEncrypt = null;
    key = null;

    return encrypted;
  }

  private async decryptSecret(value: EncString, userId: UserId): Promise<Jsonify<Secret>> {
    // decrypt the data and drop the key
    let key = await this.keyService.getUserKey(userId);
    let decrypted = await this.encryptService.decryptToUtf8(value, key);
    key = null;

    const unpacked = this.dataPacker.unpack(decrypted);
    decrypted = null;

    return unpacked;
  }
}

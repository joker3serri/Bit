import { KdfConfig } from "../../auth/models/domain/kdf-config";
import { CsprngArray } from "../../types/csprng";
import { KdfType } from "../enums";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";

export abstract class KeyGenerationService {
  /**
   * Generates a key of the given length suitable for use in AES encryption
   * @param bitLength Length of key.
   * 256 bits = 32 bytes
   * 512 bits = 64 bytes
   * @returns Generated key.
   */
  createKey: (bitLength: 256 | 512) => Promise<SymmetricCryptoKey>;
  /**
   * Generates Csprng material and derives a 64 byte key from it
   * @param bitLength Length of material.
   * @param salt Salt for the key derivation function.
   * @param purpose Purpose for the key derivation function.
   * Different purposes results in different keys, even with the same material.
   * @returns Csprng material and derived key.
   */
  createMaterialAndKey: (
    bitLength: 128 | 192 | 256 | 512,
    salt: string,
    purpose: string,
  ) => Promise<[CsprngArray, SymmetricCryptoKey]>;
  /**
   * Derives a 64 byte key from Csprng material.
   * @remark The Csprng material should be generated from {@link createKey}, or {@link createMaterialAndKey}.
   * @param material Csprng material.
   * @param salt Salt for the key derivation function.
   * @param purpose Purpose for the key derivation function.
   * Different purposes results in different keys, even with the same material.
   * @returns 64 byte derived key.
   */
  deriveKeyFromMaterial: (
    material: CsprngArray,
    salt: string,
    purpose: string,
  ) => Promise<SymmetricCryptoKey>;
  /**
   * Derives a 32 byte key from a password using a key derivation function.
   * @param password Password to derive the key from.
   * @param salt Salt for the key derivation function.
   * @param kdf Key derivation function to use.
   * @param kdfConfig Configuration for the key derivation function.
   * @returns 32 byte derived key.
   */
  deriveKeyFromPassword: (
    password: string | Uint8Array,
    salt: string | Uint8Array,
    kdf: KdfType,
    kdfConfig: KdfConfig,
  ) => Promise<SymmetricCryptoKey>;
}

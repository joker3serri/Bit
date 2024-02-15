import { KdfConfig } from "../../auth/models/domain/kdf-config";
import { KdfType } from "../enums";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";

export abstract class KeyGenerationService {
  createKey: (bitLength: 128 | 192 | 256 | 512) => Promise<SymmetricCryptoKey>;
  deriveKeyFromMaterial: (
    keyMaterial: Uint8Array,
    salt: string,
    purpose: string,
  ) => Promise<SymmetricCryptoKey>;
  deriveKeyFromPassword: (
    password: string | Uint8Array,
    salt: string | Uint8Array,
    kdf: KdfType,
    kdfConfig: KdfConfig,
  ) => Promise<SymmetricCryptoKey>;
}

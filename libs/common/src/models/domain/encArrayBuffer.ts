import { EncryptionType } from "@bitwarden/common/enums/encryptionType";
import { IEncrypted } from "@bitwarden/common/interfaces/IEncrypted";

const encTypeLength = 1;
const ivLength = 16;
const macLength = 32;
const minDataLength = 1;

const decryptionError =
  "Error parsing encrypted ArrayBuffer: data is corrupted or has an invalid format.";

export class EncArrayBuffer implements IEncrypted {
  readonly encryptionType: EncryptionType = null;

  readonly dataBytes: ArrayBuffer = null;
  readonly ivBytes: ArrayBuffer = null;
  readonly macBytes: ArrayBuffer = null;

  constructor(readonly buffer: ArrayBuffer) {
    const encBytes = new Uint8Array(buffer);
    const encType = encBytes[0];

    switch (encType) {
      case EncryptionType.AesCbc128_HmacSha256_B64:
      case EncryptionType.AesCbc256_HmacSha256_B64: {
        const minimumLength = encTypeLength + ivLength + macLength + minDataLength;
        if (encBytes.length < minimumLength) {
          throw new Error(decryptionError);
        }

        this.ivBytes = encBytes.slice(encTypeLength, encTypeLength + ivLength).buffer;
        this.macBytes = encBytes.slice(
          encTypeLength + ivLength,
          encTypeLength + ivLength + macLength
        ).buffer;
        this.dataBytes = encBytes.slice(encTypeLength + ivLength + macLength).buffer;
        break;
      }
      case EncryptionType.AesCbc256_B64: {
        const minimumLength = encTypeLength + ivLength + minDataLength;
        if (encBytes.length < minimumLength) {
          throw new Error(decryptionError);
        }

        this.ivBytes = encBytes.slice(encTypeLength, encTypeLength + ivLength).buffer;
        this.dataBytes = encBytes.slice(encTypeLength + ivLength).buffer;
        break;
      }
      default:
        throw new Error(decryptionError);
    }

    this.encryptionType = encType;
  }
}

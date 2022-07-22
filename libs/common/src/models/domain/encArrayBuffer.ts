import { EncryptionType } from "@bitwarden/common/enums/encryptionType";
import { IEncrypted } from "@bitwarden/common/interfaces/IEncrypted";

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
      case EncryptionType.AesCbc256_HmacSha256_B64:
        if (encBytes.length <= 49) {
          // 1 + 16 + 32 + ctLength
          return;
        }

        this.encryptionType = encType;
        this.ivBytes = encBytes.slice(1, 17).buffer;
        this.macBytes = encBytes.slice(17, 49).buffer;
        this.dataBytes = encBytes.slice(49).buffer;
        break;
      case EncryptionType.AesCbc256_B64:
        if (encBytes.length <= 17) {
          // 1 + 16 + ctLength
          return;
        }

        this.encryptionType = encType;
        this.ivBytes = encBytes.slice(1, 17).buffer;
        this.dataBytes = encBytes.slice(17).buffer;
        break;
      default:
        return;
    }
  }
}

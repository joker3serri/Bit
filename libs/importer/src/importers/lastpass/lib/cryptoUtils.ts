import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

export class CryptoUtils {
  cryptoFunctionService: CryptoFunctionService;

  constructor(cryptoFunctionService: CryptoFunctionService) {
    this.cryptoFunctionService = cryptoFunctionService;
  }

  async decryptAes256PlainWithDefault(
    data: Uint8Array,
    encryptionKey: Uint8Array,
    defaultValue: string
  ) {
    try {
      return this.decryptAes256Plain(data, encryptionKey);
    } catch {
      return defaultValue;
    }
  }

  async decryptAes256Base64WithDefault(
    data: Uint8Array,
    encryptionKey: Uint8Array,
    defaultValue: string
  ) {
    try {
      return this.decryptAes256Base64(data, encryptionKey);
    } catch {
      return defaultValue;
    }
  }

  async decryptAes256Plain(data: Uint8Array, encryptionKey: Uint8Array) {
    if (data.length === 0) {
      return "";
    }
    // Byte 33 == character '!'
    if (data[0] === 33 && data.length % 16 === 1 && data.length > 32) {
      return this.decryptAes256CbcPlain(data, encryptionKey);
    }
    return this.decryptAes256EcbPlain(data, encryptionKey);
  }

  async decryptAes256Base64(data: Uint8Array, encryptionKey: Uint8Array) {
    if (data.length === 0) {
      return "";
    }
    // Byte 33 == character '!'
    if (data[0] === 33) {
      return this.decryptAes256CbcBase64(data, encryptionKey);
    }
    return this.decryptAes256EcbBase64(data, encryptionKey);
  }

  async decryptAes256(
    data: Uint8Array,
    encryptionKey: Uint8Array,
    mode: "cbc" | "ecb",
    iv: Uint8Array = new Uint8Array(16)
  ): Promise<string> {
    if (data.length === 0) {
      return "";
    }
    // TODO: pass mode
    const plain = await this.cryptoFunctionService.aesDecrypt(data, iv, encryptionKey);
    return Utils.fromBufferToUtf8(plain);
  }

  private async decryptAes256EcbPlain(data: Uint8Array, encryptionKey: Uint8Array) {
    return this.decryptAes256(data, encryptionKey, "ecb");
  }

  private async decryptAes256EcbBase64(data: Uint8Array, encryptionKey: Uint8Array) {
    const d = Utils.fromB64ToArray(Utils.fromBufferToUtf8(data));
    return this.decryptAes256(d, encryptionKey, "ecb");
  }

  private async decryptAes256CbcPlain(data: Uint8Array, encryptionKey: Uint8Array) {
    const d = data.subarray(17);
    const iv = data.subarray(1, 17);
    return this.decryptAes256(d, encryptionKey, "cbc", iv);
  }

  private async decryptAes256CbcBase64(data: Uint8Array, encryptionKey: Uint8Array) {
    const d = Utils.fromB64ToArray(Utils.fromBufferToUtf8(data.subarray(26)));
    const iv = Utils.fromB64ToArray(Utils.fromBufferToUtf8(data.subarray(1, 25)));
    return this.decryptAes256(d, encryptionKey, "cbc", iv);
  }
}

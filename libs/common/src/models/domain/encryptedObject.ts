// @ts-strict-ignore
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

export class EncryptedObject {
  iv: ArrayBuffer;
  data: ArrayBuffer;
  mac: ArrayBuffer;
  key: SymmetricCryptoKey;
}

import { Utils } from "@bitwarden/common/misc/utils";

import { makeStaticByteArray } from "../../../spec/utils";

import { AccountKeys, EncryptionPair } from "./account";
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

describe("AccountKeys", () => {
  const buffer = makeStaticByteArray(64).buffer;
  const symmetricKey = new SymmetricCryptoKey(buffer);

  describe("toJSON", () => {
    it("should serialize itself", () => {
      const keys = new AccountKeys();
      keys.cryptoMasterKey = symmetricKey;
      keys.publicKey = buffer;
      keys.cryptoSymmetricKey = new EncryptionPair<string, SymmetricCryptoKey>();
      keys.cryptoSymmetricKey.decrypted = symmetricKey;
      keys.providerKeys = new EncryptionPair<
        Record<string, string>,
        Record<string, SymmetricCryptoKey>
      >();
      keys.providerKeys.encrypted = { test: "test" };
      keys.providerKeys.decrypted = { providerId: symmetricKey };

      const symmetricKeySpy = jest.spyOn(symmetricKey, "toJSON");
      const actual = keys.toJSON();
      expect(symmetricKeySpy).toHaveBeenCalled();
      expect(actual.publicKeySerialized).toEqual(Utils.fromBufferToByteString(buffer));
      expect(actual.providerKeys.decrypted).toEqual({ providerId: symmetricKey });
    });

    it("should serialize public key as a string", () => {
      const keys = new AccountKeys();
      keys.publicKey = Utils.fromByteStringToArray("hello").buffer;
      const json = JSON.stringify(keys);
      expect(json).toContain('"publicKeySerialized":"hello"');
    });
  });

  describe("fromJSON", () => {
    it("should deserialize public key to a buffer", () => {
      const keys = AccountKeys.fromJSON({
        publicKeySerialized: "hello",
      });
      expect(keys.publicKey).toEqual(Utils.fromByteStringToArray("hello").buffer);
    });

    it("should deserialize cryptoMasterKey", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({});
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize organizationKeys", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({
        organizationKeys: {
          encrypted: {},
          decrypted: {
            "00000000-0000-0000-0000-000000000000": {
              keyB64: symmetricKey.keyB64,
            },
          },
          decryptedSerialized: null,
        },
      });
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize providerKeys", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({
        providerKeys: {
          encrypted: {},
          decrypted: {
            "00000000-0000-0000-0000-000000000000": {
              keyB64: symmetricKey.keyB64,
            },
          },
          decryptedSerialized: null,
        },
      });
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize privateKey", () => {
      const spy = jest.spyOn(EncryptionPair, "fromJSON");
      AccountKeys.fromJSON({
        privateKey: { encrypted: "encrypted", decrypted: null, decryptedSerialized: "test" },
      });
      expect(spy).toHaveBeenCalled();
    });
  });
});

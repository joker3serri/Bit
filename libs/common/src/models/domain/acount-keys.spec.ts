import { Utils } from "@bitwarden/common/misc/utils";

import { makeStaticByteArray } from "../../../spec/utils";

import { AccountKeys, EncryptionPair } from "./account";
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

describe("AccountKeys", () => {
  describe("toJSON", () => {
    it("should serialize itself", () => {
      const keys = new AccountKeys();
      const buffer = makeStaticByteArray(64).buffer;
      const symmetricKey = new SymmetricCryptoKey(buffer);
      keys.cryptoMasterKey = symmetricKey;
      keys.publicKey = buffer;
      keys.cryptoSymmetricKey = new EncryptionPair<string, SymmetricCryptoKey>();
      keys.cryptoSymmetricKey.decrypted = symmetricKey;

      const symmetricKeySpy = jest.spyOn(symmetricKey, "toJSON");
      const actual = JSON.stringify(keys.toJSON());
      expect(symmetricKeySpy).toHaveBeenCalled();
      expect(actual).toContain(`"cryptoMasterKey":${JSON.stringify(symmetricKey.toJSON())}`);
      expect(actual).toContain(
        `"publicKeySerialized":${JSON.stringify(Utils.fromBufferToByteString(buffer))}`
      );
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
      AccountKeys.fromJSON({ organizationKeys: [{ orgId: "keyJSON" }] });
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize providerKeys", () => {
      const spy = jest.spyOn(SymmetricCryptoKey, "fromJSON");
      AccountKeys.fromJSON({ providerKeys: [{ providerId: "keyJSON" }] });
      expect(spy).toHaveBeenCalled();
    });

    it("should deserialize privateKey", () => {
      const spy = jest.spyOn(EncryptionPair, "fromJSON");
      AccountKeys.fromJSON({ privateKey: { encrypted: "encrypted", decrypted: "decrypted" } });
      expect(spy).toHaveBeenCalled();
    });
  });
});

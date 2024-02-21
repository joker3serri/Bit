import { mock } from "jest-mock-extended";

import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { UserId } from "../../../types/guid";
import { UserKey } from "../../../types/key";

import { SecretClassifier } from "./secret-classifier";
import { UserKeyEncryptor } from "./user-key-encryptor";

function mockEncryptService(): EncryptService {
  return mock<EncryptService>({
    // The mocks accept any and cast because the data flow is what's being
    // tested. The tests expect the raw strings to just flow through the service.
    // This holds only because the UserKeyEncryptor treats encryption and key data
    // as an opaque value. Since it never inspects them in their "encrypted" form
    // and typescript erases its types, this "just works". It'll "just break", however,
    // if the encryptor embeds the cryptosystem.
    encrypt: jest.fn((p: any, _key: SymmetricCryptoKey) => Promise.resolve(p as EncString)),
    decryptToUtf8: jest.fn((c: any, _key: SymmetricCryptoKey) => Promise.resolve(c as string)),
  });
}

function mockKeyService(value: any = {}): CryptoService {
  return mock<CryptoService>({
    // Flow an object through the key service for data flow testing.
    // Since the key is never used by the mock encryption service, only
    // its "toBe" identity is important.
    getUserKey: jest.fn((_: UserId) => Promise.resolve(value as UserKey)),
  });
}

describe("UserKeyEncryptor", () => {
  describe("encrypt", () => {
    it("should throw if value was not supplied", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;

      expect.assertions(2);
      await expect(encryptor.encrypt(null, userId)).rejects.toThrow(
        "value cannot be null or undefined",
      );
      await expect(encryptor.encrypt(undefined, userId)).rejects.toThrow(
        "value cannot be null or undefined",
      );
    });

    it("should throw if userId was not supplied", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);

      expect.assertions(2);
      await expect(encryptor.encrypt({} as any, null)).rejects.toThrow(
        "userId cannot be null or undefined",
      );
      await expect(encryptor.encrypt({} as any, undefined)).rejects.toThrow(
        "userId cannot be null or undefined",
      );
    });

    it("should encrypt a stringified value using the user's key", async () => {
      const encryptService = mockEncryptService();
      const key = {};
      const keyService = mockKeyService(key);
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;

      const [encrypted] = await encryptor.encrypt({ foo: true }, userId);

      expect(keyService.getUserKey).toHaveBeenCalledWith(userId);
      const jsonified = `512{"foo":true}${"0".repeat(497)}`;
      expect(encryptService.encrypt).toHaveBeenCalledWith(jsonified, key);
      expect(encrypted).toEqual(jsonified);
    });

    it("should pad to a multiple of the frame size", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier, {
        frameSize: 8,
      });
      const userId = "foo" as UserId;

      const [encrypted] = await encryptor.encrypt({ foo: true }, userId);
      expect((encrypted as unknown as string).length).toEqual(16);
    });

    it("should output disclosed properties", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>().disclose("foo");
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier, {
        frameSize: 8,
      });
      const userId = "foo" as UserId;

      const [, disclosed] = await encryptor.encrypt({ foo: true }, userId);
      expect(disclosed).toEqual({ foo: true });
    });
  });

  describe("decrypt", () => {
    it("should throw if secret was not supplied", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;

      expect.assertions(2);
      await expect(encryptor.decrypt(null, {} as any, userId)).rejects.toThrow(
        "secret cannot be null or undefined",
      );
      await expect(encryptor.decrypt(undefined, {} as any, userId)).rejects.toThrow(
        "secret cannot be null or undefined",
      );
    });

    it("should throw if disclosed was not supplied", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;

      expect.assertions(2);
      await expect(encryptor.decrypt({} as any, null, userId)).rejects.toThrow(
        "disclosed cannot be null or undefined",
      );
      await expect(encryptor.decrypt({} as any, undefined, userId)).rejects.toThrow(
        "disclosed cannot be null or undefined",
      );
    });

    it("should throw if userId was not supplied", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);

      expect.assertions(2);
      await expect(encryptor.decrypt({} as any, {} as any, null)).rejects.toThrow(
        "userId cannot be null or undefined",
      );
      await expect(encryptor.decrypt({} as any, {} as any, undefined)).rejects.toThrow(
        "userId cannot be null or undefined",
      );
    });

    it("should decrypt a Jsonified value using the user's key", async () => {
      const encryptService = mockEncryptService();
      const key = {};
      const keyService = mockKeyService(key);
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `512{"foo":true}${"0".repeat(497)}` as unknown as EncString;

      const decrypted = await encryptor.decrypt(encrypted, {} as any, userId);

      expect(keyService.getUserKey).toHaveBeenCalledWith(userId);
      expect(encryptService.decryptToUtf8).toHaveBeenCalledWith(encrypted, key);
      expect(decrypted).toEqual({ foo: true });
    });

    it("should combine decrypted secrets and disclosed data", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean; bar: boolean }>().disclose(
        "bar",
      );
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `512{"foo":true}${"0".repeat(497)}` as unknown as EncString;

      const decrypted = await encryptor.decrypt(encrypted, { bar: true } as any, userId);

      expect(decrypted).toEqual({ foo: true, bar: true });
    });

    it("should preserve decrypted secrets", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `512{"foo":true,"bar":true}${"0".repeat(486)}` as unknown as EncString;

      const decrypted = await encryptor.decrypt(encrypted, {} as any, userId);

      expect(decrypted).toEqual({ foo: true, bar: true });
    });

    it("should throw an error when the frame size is missing", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `{"foo":true}${"0".repeat(16)}` as unknown as EncString;

      expect.assertions(1);
      await expect(encryptor.decrypt(encrypted, {} as any, userId)).rejects.toThrow(
        "missing frame size",
      );
    });

    it("should throw an error when the length is not a multiple of the frame size", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `16{"foo":true}0` as unknown as EncString;

      expect.assertions(1);
      await expect(encryptor.decrypt(encrypted, {} as any, userId)).rejects.toThrow(
        "invalid length",
      );
    });

    it("should throw an error when the json object is not closed", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `16{"foo":true000` as unknown as EncString;

      expect.assertions(1);
      await expect(encryptor.decrypt(encrypted, {} as any, userId)).rejects.toThrow(
        "missing json object",
      );
    });

    it("should throw an error when the padding contains a non-0 character", async () => {
      const encryptService = mockEncryptService();
      const keyService = mockKeyService();
      const classifier = SecretClassifier.allSecret<{ foo: boolean }>();
      const encryptor = new UserKeyEncryptor(encryptService, keyService, classifier);
      const userId = "foo" as UserId;
      const encrypted = `16{"foo":true}01` as unknown as EncString;

      expect.assertions(1);
      await expect(encryptor.decrypt(encrypted, {} as any, userId)).rejects.toThrow(
        "invalid padding",
      );
    });
  });
});

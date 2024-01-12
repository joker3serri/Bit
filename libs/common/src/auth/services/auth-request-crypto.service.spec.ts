import { mock } from "jest-mock-extended";

import { FakeAccountService, mockAccountServiceWith } from "../../../spec/fake-account-service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { Utils } from "../../platform/misc/utils";
import {
  MasterKey,
  SymmetricCryptoKey,
  UserKey,
} from "../../platform/models/domain/symmetric-crypto-key";
import { UserId } from "../../types/guid";
import { AuthRequestCryptoServiceAbstraction } from "../abstractions/auth-request-crypto.service.abstraction";
import { AuthRequestResponse } from "../models/response/auth-request.response";

import { AuthRequestCryptoServiceImplementation } from "./auth-request-crypto.service.implementation";
import { FakeMasterPasswordService } from "./master-password/fake-master-password.service";

describe("AuthRequestCryptoService", () => {
  let authReqCryptoService: AuthRequestCryptoServiceAbstraction;
  let accountService: FakeAccountService;
  let masterPasswordService: FakeMasterPasswordService;
  const cryptoService = mock<CryptoService>();
  let mockPrivateKey: Uint8Array;
  const mockUserId = Utils.newGuid() as UserId;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    accountService = mockAccountServiceWith(mockUserId);
    masterPasswordService = new FakeMasterPasswordService();

    authReqCryptoService = new AuthRequestCryptoServiceImplementation(
      accountService,
      masterPasswordService,
      cryptoService,
    );

    mockPrivateKey = new Uint8Array(64);
  });

  it("instantiates", () => {
    expect(authReqCryptoService).not.toBeFalsy();
  });

  describe("setUserKeyAfterDecryptingSharedUserKey", () => {
    it("decrypts and sets user key when given valid auth request response and private key", async () => {
      // Arrange
      const mockAuthReqResponse = {
        key: "authReqPublicKeyEncryptedUserKey",
      } as AuthRequestResponse;

      const mockDecryptedUserKey = {} as UserKey;
      jest
        .spyOn(authReqCryptoService, "decryptPubKeyEncryptedUserKey")
        .mockResolvedValueOnce(mockDecryptedUserKey);

      cryptoService.setUserKey.mockResolvedValueOnce(undefined);

      // Act
      await authReqCryptoService.setUserKeyAfterDecryptingSharedUserKey(
        mockAuthReqResponse,
        mockPrivateKey,
      );

      // Assert
      expect(authReqCryptoService.decryptPubKeyEncryptedUserKey).toBeCalledWith(
        mockAuthReqResponse.key,
        mockPrivateKey,
      );
      expect(cryptoService.setUserKey).toBeCalledWith(mockDecryptedUserKey);
    });
  });

  describe("setKeysAfterDecryptingSharedMasterKeyAndHash", () => {
    it("decrypts and sets master key and hash and user key when given valid auth request response and private key", async () => {
      // Arrange
      const mockAuthReqResponse = {
        key: "authReqPublicKeyEncryptedMasterKey",
        masterPasswordHash: "authReqPublicKeyEncryptedMasterKeyHash",
      } as AuthRequestResponse;

      const mockDecryptedMasterKey = {} as MasterKey;
      const mockDecryptedMasterKeyHash = "mockDecryptedMasterKeyHash";
      const mockDecryptedUserKey = {} as UserKey;

      jest
        .spyOn(authReqCryptoService, "decryptPubKeyEncryptedMasterKeyAndHash")
        .mockResolvedValueOnce({
          masterKey: mockDecryptedMasterKey,
          masterKeyHash: mockDecryptedMasterKeyHash,
        });

      masterPasswordService.masterKeySubject.next(undefined);
      masterPasswordService.masterKeyHashSubject.next(undefined);
      cryptoService.decryptUserKeyWithMasterKey.mockResolvedValueOnce(mockDecryptedUserKey);
      cryptoService.setUserKey.mockResolvedValueOnce(undefined);

      // Act
      await authReqCryptoService.setKeysAfterDecryptingSharedMasterKeyAndHash(
        mockAuthReqResponse,
        mockPrivateKey,
      );

      // Assert
      expect(authReqCryptoService.decryptPubKeyEncryptedMasterKeyAndHash).toBeCalledWith(
        mockAuthReqResponse.key,
        mockAuthReqResponse.masterPasswordHash,
        mockPrivateKey,
      );
      expect(masterPasswordService.mock.setMasterKey).toHaveBeenCalledWith(
        mockDecryptedMasterKey,
        mockUserId,
      );
      expect(masterPasswordService.mock.setMasterKeyHash).toHaveBeenCalledWith(
        mockDecryptedMasterKeyHash,
        mockUserId,
      );
      expect(cryptoService.decryptUserKeyWithMasterKey).toHaveBeenCalledWith(
        mockDecryptedMasterKey,
      );
      expect(cryptoService.setUserKey).toHaveBeenCalledWith(mockDecryptedUserKey);
    });
  });

  describe("decryptAuthReqPubKeyEncryptedUserKey", () => {
    it("returns a decrypted user key when given valid public key encrypted user key and an auth req private key", async () => {
      // Arrange
      const mockPubKeyEncryptedUserKey = "pubKeyEncryptedUserKey";
      const mockDecryptedUserKeyBytes = new Uint8Array(64);
      const mockDecryptedUserKey = new SymmetricCryptoKey(mockDecryptedUserKeyBytes) as UserKey;

      cryptoService.rsaDecrypt.mockResolvedValueOnce(mockDecryptedUserKeyBytes);

      // Act
      const result = await authReqCryptoService.decryptPubKeyEncryptedUserKey(
        mockPubKeyEncryptedUserKey,
        mockPrivateKey,
      );

      // Assert
      expect(cryptoService.rsaDecrypt).toBeCalledWith(mockPubKeyEncryptedUserKey, mockPrivateKey);
      expect(result).toEqual(mockDecryptedUserKey);
    });
  });

  describe("decryptAuthReqPubKeyEncryptedMasterKeyAndHash", () => {
    it("returns a decrypted master key and hash when given a valid public key encrypted master key, public key encrypted master key hash, and an auth req private key", async () => {
      // Arrange
      const mockPubKeyEncryptedMasterKey = "pubKeyEncryptedMasterKey";
      const mockPubKeyEncryptedMasterKeyHash = "pubKeyEncryptedMasterKeyHash";

      const mockDecryptedMasterKeyBytes = new Uint8Array(64);
      const mockDecryptedMasterKey = new SymmetricCryptoKey(
        mockDecryptedMasterKeyBytes,
      ) as MasterKey;
      const mockDecryptedMasterKeyHashBytes = new Uint8Array(64);
      const mockDecryptedMasterKeyHash = Utils.fromBufferToUtf8(mockDecryptedMasterKeyHashBytes);

      cryptoService.rsaDecrypt
        .mockResolvedValueOnce(mockDecryptedMasterKeyBytes)
        .mockResolvedValueOnce(mockDecryptedMasterKeyHashBytes);

      // Act
      const result = await authReqCryptoService.decryptPubKeyEncryptedMasterKeyAndHash(
        mockPubKeyEncryptedMasterKey,
        mockPubKeyEncryptedMasterKeyHash,
        mockPrivateKey,
      );

      // Assert
      expect(cryptoService.rsaDecrypt).toHaveBeenNthCalledWith(
        1,
        mockPubKeyEncryptedMasterKey,
        mockPrivateKey,
      );
      expect(cryptoService.rsaDecrypt).toHaveBeenNthCalledWith(
        2,
        mockPubKeyEncryptedMasterKeyHash,
        mockPrivateKey,
      );
      expect(result.masterKey).toEqual(mockDecryptedMasterKey);
      expect(result.masterKeyHash).toEqual(mockDecryptedMasterKeyHash);
    });
  });
});

import { mock, mockReset } from "jest-mock-extended";

import { AppIdService } from "../abstractions/appId.service";
import { CryptoFunctionService } from "../abstractions/cryptoFunction.service";
import { DevicesApiServiceAbstraction } from "../abstractions/devices/devices-api.service.abstraction";
import { DeviceResponse } from "../abstractions/devices/responses/device.response";
import { EncryptService } from "../abstractions/encrypt.service";
import { LogService } from "../abstractions/log.service";
import { PlatformUtilsService } from "../abstractions/platformUtils.service";
import { StateService } from "../abstractions/state.service";
import { EncryptionType } from "../enums/encryption-type.enum";
import { EncString } from "../models/domain/enc-string";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";
import { CryptoService } from "../services/crypto.service";
import { CsprngArray } from "../types/csprng";

describe("cryptoService", () => {
  let cryptoService: CryptoService;

  const cryptoFunctionService = mock<CryptoFunctionService>();
  const encryptService = mock<EncryptService>();
  const platformUtilService = mock<PlatformUtilsService>();
  const logService = mock<LogService>();
  const stateService = mock<StateService>();
  const appIdService = mock<AppIdService>();
  const devicesApiService = mock<DevicesApiServiceAbstraction>();

  beforeEach(() => {
    mockReset(cryptoFunctionService);
    mockReset(encryptService);
    mockReset(platformUtilService);
    mockReset(logService);
    mockReset(stateService);
    mockReset(appIdService);
    mockReset(devicesApiService);

    cryptoService = new CryptoService(
      cryptoFunctionService,
      encryptService,
      platformUtilService,
      logService,
      stateService,
      appIdService,
      devicesApiService
    );
  });

  it("instantiates", () => {
    expect(cryptoService).not.toBeFalsy();
  });

  describe("Trusted Device Encryption", () => {
    const deviceKeyBytesLength = 64;
    const userSymKeyBytesLength = 64;

    describe("getDeviceKey", () => {
      let mockRandomBytes: CsprngArray;
      let mockDeviceKey: SymmetricCryptoKey;
      let existingDeviceKey: SymmetricCryptoKey;
      let stateSvcGetDeviceKeySpy: jest.SpyInstance;
      let makeDeviceKeySpy: jest.SpyInstance;

      beforeEach(() => {
        mockRandomBytes = new Uint8Array(deviceKeyBytesLength).buffer as CsprngArray;
        mockDeviceKey = new SymmetricCryptoKey(mockRandomBytes);
        existingDeviceKey = new SymmetricCryptoKey(
          new Uint8Array(deviceKeyBytesLength).buffer as CsprngArray
        );

        stateSvcGetDeviceKeySpy = jest.spyOn(stateService, "getDeviceKey");
        makeDeviceKeySpy = jest.spyOn(cryptoService, "makeDeviceKey");
      });

      it("gets a device key when there is not an existing device key", async () => {
        stateSvcGetDeviceKeySpy.mockResolvedValue(null);
        makeDeviceKeySpy.mockResolvedValue(mockDeviceKey);

        const deviceKey = await cryptoService.getDeviceKey();

        expect(stateSvcGetDeviceKeySpy).toHaveBeenCalledTimes(1);
        expect(makeDeviceKeySpy).toHaveBeenCalledTimes(1);

        expect(deviceKey).not.toBeNull();
        expect(deviceKey).toBeInstanceOf(SymmetricCryptoKey);
        expect(deviceKey).toEqual(mockDeviceKey);
      });

      it("returns the existing device key without creating a new one when there is an existing device key", async () => {
        stateSvcGetDeviceKeySpy.mockResolvedValue(existingDeviceKey);

        const deviceKey = await cryptoService.getDeviceKey();

        expect(stateSvcGetDeviceKeySpy).toHaveBeenCalledTimes(1);
        expect(makeDeviceKeySpy).not.toHaveBeenCalled();

        expect(deviceKey).not.toBeNull();
        expect(deviceKey).toBeInstanceOf(SymmetricCryptoKey);
        expect(deviceKey).toEqual(existingDeviceKey);
      });
    });

    describe("makeDeviceKey", () => {
      it("creates a new non-null 64 byte device key, securely stores it, and returns it", async () => {
        const mockRandomBytes = new Uint8Array(deviceKeyBytesLength).buffer as CsprngArray;

        const cryptoFuncSvcRandomBytesSpy = jest
          .spyOn(cryptoFunctionService, "randomBytes")
          .mockResolvedValue(mockRandomBytes);

        const stateSvcSetDeviceKeySpy = jest.spyOn(stateService, "setDeviceKey");

        const deviceKey = await cryptoService.makeDeviceKey();

        expect(cryptoFuncSvcRandomBytesSpy).toHaveBeenCalledTimes(1);
        expect(cryptoFuncSvcRandomBytesSpy).toHaveBeenCalledWith(deviceKeyBytesLength);

        expect(deviceKey).not.toBeNull();
        expect(deviceKey).toBeInstanceOf(SymmetricCryptoKey);

        expect(stateSvcSetDeviceKeySpy).toHaveBeenCalledTimes(1);
        expect(stateSvcSetDeviceKeySpy).toHaveBeenCalledWith(deviceKey);
      });
    });

    describe("trustDevice", () => {
      let mockDeviceKeyRandomBytes: CsprngArray;
      let mockDeviceKey: SymmetricCryptoKey;

      let mockUserSymKeyRandomBytes: CsprngArray;
      let mockUserSymKey: SymmetricCryptoKey;

      const deviceRsaKeyLength = 2048;
      let mockDeviceRsaKeyPair: [ArrayBuffer, ArrayBuffer];
      let mockDevicePrivateKey: ArrayBuffer;
      let mockDevicePublicKey: ArrayBuffer;
      let mockDevicePublicKeyEncryptedUserSymKey: EncString;
      let mockUserSymKeyEncryptedDevicePublicKey: EncString;
      let mockDeviceKeyEncryptedDevicePrivateKey: EncString;

      const mockDeviceResponse: DeviceResponse = new DeviceResponse({
        Id: "mockId",
        Name: "mockName",
        Identifier: "mockIdentifier",
        Type: "mockType",
        CreationDate: "mockCreationDate",
      });

      const mockDeviceId = "mockDeviceId";

      let makeDeviceKeySpy: jest.SpyInstance;
      let rsaGenerateKeyPairSpy: jest.SpyInstance;
      let getKeySpy: jest.SpyInstance;
      let rsaEncryptSpy: jest.SpyInstance;
      let encryptServiceEncryptSpy: jest.SpyInstance;
      let appIdServiceGetAppIdSpy: jest.SpyInstance;
      let devicesApiServiceCreateTrustedDeviceKeysSpy: jest.SpyInstance;

      beforeEach(() => {
        // Setup all spies and default return values for the happy path

        mockDeviceKeyRandomBytes = new Uint8Array(deviceKeyBytesLength).buffer as CsprngArray;
        mockDeviceKey = new SymmetricCryptoKey(mockDeviceKeyRandomBytes);

        mockUserSymKeyRandomBytes = new Uint8Array(userSymKeyBytesLength).buffer as CsprngArray;
        mockUserSymKey = new SymmetricCryptoKey(mockUserSymKeyRandomBytes);

        mockDeviceRsaKeyPair = [
          new ArrayBuffer(deviceRsaKeyLength),
          new ArrayBuffer(deviceRsaKeyLength),
        ];

        mockDevicePublicKey = mockDeviceRsaKeyPair[0];
        mockDevicePrivateKey = mockDeviceRsaKeyPair[1];

        mockDevicePublicKeyEncryptedUserSymKey = new EncString(
          EncryptionType.Rsa2048_OaepSha1_B64,
          "mockDevicePublicKeyEncryptedUserSymKey"
        );

        mockUserSymKeyEncryptedDevicePublicKey = new EncString(
          EncryptionType.AesCbc256_HmacSha256_B64,
          "mockUserSymKeyEncryptedDevicePublicKey"
        );

        mockDeviceKeyEncryptedDevicePrivateKey = new EncString(
          EncryptionType.AesCbc256_HmacSha256_B64,
          "mockDeviceKeyEncryptedDevicePrivateKey"
        );

        makeDeviceKeySpy = jest
          .spyOn(cryptoService, "makeDeviceKey")
          .mockResolvedValue(mockDeviceKey);

        rsaGenerateKeyPairSpy = jest
          .spyOn(cryptoFunctionService, "rsaGenerateKeyPair")
          .mockResolvedValue(mockDeviceRsaKeyPair);

        getKeySpy = jest.spyOn(cryptoService, "getKey").mockResolvedValue(mockUserSymKey);

        rsaEncryptSpy = jest
          .spyOn(cryptoService, "rsaEncrypt")
          .mockResolvedValue(mockDevicePublicKeyEncryptedUserSymKey);

        encryptServiceEncryptSpy = jest
          .spyOn(encryptService, "encrypt")
          .mockImplementation((plainValue, key) => {
            if (plainValue === mockDevicePublicKey && key === mockUserSymKey) {
              return Promise.resolve(mockUserSymKeyEncryptedDevicePublicKey);
            }
            if (plainValue === mockDevicePrivateKey && key === mockDeviceKey) {
              return Promise.resolve(mockDeviceKeyEncryptedDevicePrivateKey);
            }
          });

        appIdServiceGetAppIdSpy = jest
          .spyOn(appIdService, "getAppId")
          .mockResolvedValue(mockDeviceId);

        devicesApiServiceCreateTrustedDeviceKeysSpy = jest
          .spyOn(devicesApiService, "createTrustedDeviceKeys")
          .mockResolvedValue(mockDeviceResponse);
      });

      it("calls the required methods with the correct arguments and returns a DeviceResponse", async () => {
        const response = await cryptoService.trustDevice();

        expect(makeDeviceKeySpy).toHaveBeenCalledTimes(1);
        expect(rsaGenerateKeyPairSpy).toHaveBeenCalledTimes(1);
        expect(getKeySpy).toHaveBeenCalledTimes(1);

        expect(rsaEncryptSpy).toHaveBeenCalledTimes(1);
        expect(encryptServiceEncryptSpy).toHaveBeenCalledTimes(2);

        expect(appIdServiceGetAppIdSpy).toHaveBeenCalledTimes(1);
        expect(devicesApiServiceCreateTrustedDeviceKeysSpy).toHaveBeenCalledTimes(1);
        expect(devicesApiServiceCreateTrustedDeviceKeysSpy).toHaveBeenCalledWith(
          mockDeviceId,
          mockDevicePublicKeyEncryptedUserSymKey.encryptedString,
          mockUserSymKeyEncryptedDevicePublicKey.encryptedString,
          mockDeviceKeyEncryptedDevicePrivateKey.encryptedString
        );

        expect(response).toBeInstanceOf(DeviceResponse);
        expect(response).toEqual(mockDeviceResponse);
      });

      const methodsToTestForErrorsOrInvalidReturns = [
        {
          method: "makeDeviceKey",
          spy: () => makeDeviceKeySpy,
          errorText: "makeDeviceKey error",
        },
        {
          method: "rsaGenerateKeyPair",
          spy: () => rsaGenerateKeyPairSpy,
          errorText: "rsaGenerateKeyPair error",
        },
        {
          method: "getKey",
          spy: () => getKeySpy,
          errorText: "getKey error",
        },
        {
          method: "rsaEncrypt",
          spy: () => rsaEncryptSpy,
          errorText: "rsaEncrypt error",
        },
        {
          method: "encryptService.encrypt",
          spy: () => encryptServiceEncryptSpy,
          errorText: "encryptService.encrypt error",
        },
      ];

      describe.each(methodsToTestForErrorsOrInvalidReturns)(
        "trustDevice error handling and invalid return testing",
        ({ method, spy, errorText }) => {
          // ensures that error propagation works correctly
          it(`throws an error if ${method} fails`, async () => {
            const methodSpy = spy();
            methodSpy.mockRejectedValue(new Error(errorText));
            await expect(cryptoService.trustDevice()).rejects.toThrow(errorText);
          });

          test.each([null, undefined])(
            `throws an error if ${method} returns %s`,
            async (invalidValue) => {
              const methodSpy = spy();
              methodSpy.mockResolvedValue(invalidValue);
              await expect(cryptoService.trustDevice()).rejects.toThrow();
            }
          );
        }
      );
    });
  });
});

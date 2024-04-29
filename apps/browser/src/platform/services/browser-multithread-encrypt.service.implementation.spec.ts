import { mock, MockProxy } from "jest-mock-extended";

import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { EncryptionType } from "@bitwarden/common/platform/enums";
import { Decryptable } from "@bitwarden/common/platform/interfaces/decryptable.interface";
import { InitializerMetadata } from "@bitwarden/common/platform/interfaces/initializer-metadata.interface";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { InitializerKey } from "@bitwarden/common/platform/services/cryptography/initializer-key";
import { makeStaticByteArray } from "@bitwarden/common/spec";

import { BrowserApi } from "../browser/browser-api";

import { BrowserMultithreadEncryptServiceImplementation } from "./browser-multithread-encrypt.service.implementation";

describe("BrowserMultithreadEncryptServiceImplementation", () => {
  let cryptoFunctionServiceMock: MockProxy<CryptoFunctionService>;
  let logServiceMock: MockProxy<LogService>;
  let encryptService: BrowserMultithreadEncryptServiceImplementation;
  const manifestVersionSpy = jest.spyOn(BrowserApi, "manifestVersion", "get");
  const createOffscreenDocumentSpy = jest.spyOn(BrowserApi, "createOffscreenDocument");
  const closeOffscreenDocumentSpy = jest.spyOn(BrowserApi, "closeOffscreenDocument");
  const sendMessageWithResponseSpy = jest.spyOn(BrowserApi, "sendMessageWithResponse");
  const encType = EncryptionType.AesCbc256_HmacSha256_B64;
  const key = new SymmetricCryptoKey(makeStaticByteArray(64, 100), encType);
  const items: Decryptable<InitializerMetadata>[] = [
    {
      decrypt: jest.fn(),
      initializerKey: InitializerKey.Cipher,
    },
  ];

  beforeEach(() => {
    cryptoFunctionServiceMock = mock<CryptoFunctionService>();
    logServiceMock = mock<LogService>();
    encryptService = new BrowserMultithreadEncryptServiceImplementation(
      cryptoFunctionServiceMock,
      logServiceMock,
      false,
    );
    manifestVersionSpy.mockReturnValue(3);
    createOffscreenDocumentSpy.mockImplementation();
    closeOffscreenDocumentSpy.mockImplementation();
    sendMessageWithResponseSpy.mockResolvedValue(JSON.stringify([]));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("decrypts items using web workers if the chrome.offscreen API is not supported", async () => {
    manifestVersionSpy.mockReturnValue(2);

    await encryptService.decryptItems([], key);

    expect(createOffscreenDocumentSpy).not.toHaveBeenCalled();
    expect(closeOffscreenDocumentSpy).not.toHaveBeenCalled();
  });

  it("decrypts items using the chrome.offscreen API if it is supported", async () => {
    sendMessageWithResponseSpy.mockResolvedValue(JSON.stringify(items));

    await encryptService.decryptItems(items, key);

    expect(BrowserApi.createOffscreenDocument).toHaveBeenCalled();
    expect(BrowserApi.closeOffscreenDocument).toHaveBeenCalled();
    expect(BrowserApi.sendMessageWithResponse).toHaveBeenCalledWith("offscreenDecryptItems", {
      decryptRequest: expect.any(String),
    });
  });

  it("returns an empty array if the passed items are not defined", async () => {
    const result = await encryptService.decryptItems(null, key);

    expect(result).toEqual([]);
  });

  it("returns an empty array if the offscreen document message returns an empty value", async () => {
    sendMessageWithResponseSpy.mockResolvedValue("");

    const result = await encryptService.decryptItems(items, key);

    expect(result).toEqual([]);
  });

  it("returns an empty array if the offscreen document message returns an empty array", async () => {
    sendMessageWithResponseSpy.mockResolvedValue("[]");

    const result = await encryptService.decryptItems(items, key);

    expect(result).toEqual([]);
  });
});

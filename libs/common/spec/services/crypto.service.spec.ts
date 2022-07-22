import { mock, mockReset } from "jest-mock-extended";

import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { CryptoService } from "@bitwarden/common/services/crypto.service";

import { makeStaticByteArray } from "../utils";

describe("cryptoService", () => {
  let cryptoService: CryptoService;

  const cryptoFunctionService = mock<CryptoFunctionService>();
  const encryptService = mock<AbstractEncryptService>();
  const platformUtilService = mock<PlatformUtilsService>();
  const logService = mock<LogService>();
  const stateService = mock<StateService>();

  beforeEach(() => {
    mockReset(cryptoFunctionService);
    mockReset(encryptService);
    mockReset(platformUtilService);
    mockReset(logService);
    mockReset(stateService);

    cryptoService = new CryptoService(
      cryptoFunctionService,
      encryptService,
      platformUtilService,
      logService,
      stateService
    );
  });

  it("instantiates", () => {
    expect(cryptoService).not.toBeFalsy();
  });

  describe("decryptFromBytes", () => {
    it("returns null if data is corrupted or invalid", async () => {
      // Intentionally invalid byte array
      const buffer = makeStaticByteArray(1);
      const key = new SymmetricCryptoKey(makeStaticByteArray(32));

      const actual = await cryptoService.decryptFromBytes(buffer.buffer, key);

      expect(actual).toBeNull();
      expect(encryptService.decryptToBytes).not.toHaveBeenCalled();
    });
  });
});

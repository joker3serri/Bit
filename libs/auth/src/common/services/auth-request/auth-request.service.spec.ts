import { mock } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { MasterKey, UserKey } from "@bitwarden/common/types/key";

import { AuthRequestService } from "./auth-request.service";

describe("AuthRequestService", () => {
  let sut: AuthRequestService;

  const appIdService = mock<AppIdService>();
  const cryptoService = mock<CryptoService>();
  const apiService = mock<ApiService>();
  const stateService = mock<StateService>();

  beforeEach(() => {
    jest.clearAllMocks();

    sut = new AuthRequestService(appIdService, cryptoService, apiService, stateService);
  });

  describe("approveOrDenyAuthRequest", () => {
    beforeEach(() => {
      cryptoService.rsaEncrypt.mockResolvedValue({
        encryptedString: "ENCRYPTED_STRING",
      } as EncString);
      appIdService.getAppId.mockResolvedValue("APP_ID");
    });
    it("should throw if auth request is missing id or key", async () => {
      const authRequestNoId = new AuthRequestResponse({ id: "", key: "KEY" });
      const authRequestNoKey = new AuthRequestResponse({ id: "123", key: "" });

      await expect(sut.approveOrDenyAuthRequest(true, authRequestNoId)).rejects.toThrow(
        "Auth request has no id",
      );
      await expect(sut.approveOrDenyAuthRequest(true, authRequestNoKey)).rejects.toThrow(
        "Auth request has no public key",
      );
    });

    it("should use the master key and hash if they exist", async () => {
      cryptoService.getMasterKey.mockResolvedValueOnce({ encKey: new Uint8Array(64) } as MasterKey);
      stateService.getKeyHash.mockResolvedValueOnce("KEY_HASH");

      await sut.approveOrDenyAuthRequest(true, new AuthRequestResponse({ id: "123", key: "KEY" }));

      expect(cryptoService.rsaEncrypt).toHaveBeenCalledWith(new Uint8Array(64), expect.anything());
    });

    it("should use the user key if the master key and hash do not exist", async () => {
      cryptoService.getUserKey.mockResolvedValueOnce({ key: new Uint8Array(64) } as UserKey);

      await sut.approveOrDenyAuthRequest(true, new AuthRequestResponse({ id: "123", key: "KEY" }));

      expect(cryptoService.rsaEncrypt).toHaveBeenCalledWith(new Uint8Array(64), expect.anything());
    });
  });
});

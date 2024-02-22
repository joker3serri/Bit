import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { PasswordlessAuthRequest } from "@bitwarden/common/auth/models/request/passwordless-auth.request";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { AuthRequestServiceAbstraction } from "../../abstractions/auth-request.service.abstraction";

export class AuthRequestService implements AuthRequestServiceAbstraction {
  constructor(
    private appIdService: AppIdService,
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private stateService: StateService,
  ) {}

  async approveOrDenyAuthRequest(
    approve: boolean,
    authRequest: AuthRequestResponse,
  ): Promise<AuthRequestResponse> {
    if (!authRequest.id) {
      throw new Error("Auth request has no id");
    }
    if (!authRequest.key) {
      throw new Error("Auth request has no public key");
    }
    const pubKey = Utils.fromB64ToArray(authRequest.key);

    const masterKey = await this.cryptoService.getMasterKey();
    const masterKeyHash = await this.stateService.getKeyHash();
    let encryptedMasterKeyHash;
    let keyToEncrypt;

    if (masterKey && masterKeyHash) {
      // Only encrypt the master password hash if masterKey exists as
      // we won't have a masterKeyHash without a masterKey
      encryptedMasterKeyHash = await this.cryptoService.rsaEncrypt(
        Utils.fromUtf8ToArray(masterKeyHash),
        pubKey,
      );
      keyToEncrypt = masterKey.encKey;
    } else {
      const userKey = await this.cryptoService.getUserKey();
      keyToEncrypt = userKey.key;
    }

    const encryptedKey = await this.cryptoService.rsaEncrypt(keyToEncrypt, pubKey);

    const response = new PasswordlessAuthRequest(
      encryptedKey.encryptedString,
      encryptedMasterKeyHash?.encryptedString,
      await this.appIdService.getAppId(),
      approve,
    );
    return await this.apiService.putAuthRequest(authRequest.id, response);
  }
}

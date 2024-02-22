import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { UserKey, MasterKey } from "@bitwarden/common/types/key";

export abstract class AuthRequestServiceAbstraction {
  abstract approveOrDenyAuthRequest: (
    approve: boolean,
    authRequest: AuthRequestResponse,
  ) => Promise<AuthRequestResponse>;
  abstract setUserKeyAfterDecryptingSharedUserKey: (
    authReqResponse: AuthRequestResponse,
    authReqPrivateKey: ArrayBuffer,
  ) => Promise<void>;
  abstract setKeysAfterDecryptingSharedMasterKeyAndHash: (
    authReqResponse: AuthRequestResponse,
    authReqPrivateKey: ArrayBuffer,
  ) => Promise<void>;

  abstract decryptPubKeyEncryptedUserKey: (
    pubKeyEncryptedUserKey: string,
    privateKey: ArrayBuffer,
  ) => Promise<UserKey>;

  abstract decryptPubKeyEncryptedMasterKeyAndHash: (
    pubKeyEncryptedMasterKey: string,
    pubKeyEncryptedMasterKeyHash: string,
    privateKey: ArrayBuffer,
  ) => Promise<{ masterKey: MasterKey; masterKeyHash: string }>;
}

import { map, Observable } from "rxjs";

import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { KeyDefinition, MASTER_PASSWORD_MEMORY, StateProvider } from "../../../platform/state";
import { UserId } from "../../../types/guid";
import { MasterKey } from "../../../types/key";
import { InternalMasterPasswordServiceAbstraction } from "../../abstractions/master-password.service.abstraction";
import { ForceSetPasswordReason } from "../../models/domain/force-set-password-reason";

const MASTER_KEY = new KeyDefinition<MasterKey>(MASTER_PASSWORD_MEMORY, "masterKey", {
  deserializer: (masterKey) => SymmetricCryptoKey.fromJSON(masterKey) as MasterKey,
});

const MASTER_KEY_HASH = new KeyDefinition<string>(MASTER_PASSWORD_MEMORY, "masterKeyHash", {
  deserializer: (masterKeyHash) => masterKeyHash,
});

const FORCE_SET_PASSWORD_REASON = new KeyDefinition<ForceSetPasswordReason>(
  MASTER_PASSWORD_MEMORY,
  "forceSetPasswordReason",
  {
    deserializer: (reason) => reason,
  },
);

export class MasterPasswordService implements InternalMasterPasswordServiceAbstraction {
  constructor(private stateProvider: StateProvider) {}

  masterKey$(userId: UserId): Observable<MasterKey> {
    return this.stateProvider.getUser(userId, MASTER_KEY).state$;
  }

  masterKeyHash$(userId: UserId): Observable<string> {
    return this.stateProvider.getUser(userId, MASTER_KEY_HASH).state$;
  }

  forceSetPasswordReason$(userId: UserId): Observable<ForceSetPasswordReason> {
    return this.stateProvider
      .getUser(userId, FORCE_SET_PASSWORD_REASON)
      .state$.pipe(map((reason) => reason ?? ForceSetPasswordReason.None));
  }

  async setMasterKey(masterKey: MasterKey, userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, MASTER_KEY).update((_) => masterKey);
  }

  async setMasterKeyHash(masterKeyHash: string, userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, MASTER_KEY_HASH).update((_) => masterKeyHash);
  }

  async setForceSetPasswordReason(reason: ForceSetPasswordReason, userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, FORCE_SET_PASSWORD_REASON).update((_) => reason);
  }
}

import { Observable } from "rxjs";

import { MasterKey, SymmetricCryptoKey } from "../../platform/models/domain/symmetric-crypto-key";
import {
  ActiveUserState,
  KeyDefinition,
  MASTER_PASSWORD_MEMORY,
  StateProvider,
} from "../../platform/state";
import { UserId } from "../../types/guid";
import { InternalMasterPasswordServiceAbstraction } from "../abstractions/master-password.service.abstraction";
import { ForceSetPasswordReason } from "../models/domain/force-set-password-reason";

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
  private forceSetPasswordReasonState: ActiveUserState<ForceSetPasswordReason>;

  forceSetPasswordReason$;

  constructor(private stateProvider: StateProvider) {
    this.forceSetPasswordReasonState = this.stateProvider.getActive(FORCE_SET_PASSWORD_REASON);

    this.forceSetPasswordReason$ = this.forceSetPasswordReasonState.state$;
  }

  getMasterKey$(userId: UserId): Observable<MasterKey> {
    return this.stateProvider.getUser(userId, MASTER_KEY).state$;
  }

  async setMasterKey(masterKey: MasterKey, userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, MASTER_KEY).update((_) => masterKey);
  }

  getMasterKeyHash$(userId: UserId): Observable<string> {
    return this.stateProvider.getUser(userId, MASTER_KEY_HASH).state$;
  }

  async setMasterKeyHash(masterKeyHash: string, userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, MASTER_KEY_HASH).update((_) => masterKeyHash);
  }

  async setForceSetPasswordReason(reason: ForceSetPasswordReason): Promise<void> {
    await this.forceSetPasswordReasonState.update((_) => reason);
  }
}

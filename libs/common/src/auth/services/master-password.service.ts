import { MasterKey, SymmetricCryptoKey } from "../../platform/models/domain/symmetric-crypto-key";
import {
  ActiveUserState,
  ActiveUserStateProvider,
  KeyDefinition,
  MASTER_PASSWORD_MEMORY,
} from "../../platform/state";
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
  private masterKeyState: ActiveUserState<MasterKey>;
  private masterKeyHashState: ActiveUserState<string>;
  private forceSetPasswordReasonState: ActiveUserState<ForceSetPasswordReason>;

  masterKey$;
  masterKeyHash$;
  forceSetPasswordReason$;

  constructor(private stateProvider: ActiveUserStateProvider) {
    this.masterKeyState = this.stateProvider.get(MASTER_KEY);
    this.masterKeyHashState = this.stateProvider.get(MASTER_KEY_HASH);
    this.forceSetPasswordReasonState = this.stateProvider.get(FORCE_SET_PASSWORD_REASON);

    this.masterKey$ = this.masterKeyState.state$;
    this.masterKeyHash$ = this.masterKeyHashState.state$;
    this.forceSetPasswordReason$ = this.forceSetPasswordReasonState.state$;
  }

  async setMasterKey(masterKey: MasterKey): Promise<void> {
    this.masterKeyState.update((_) => masterKey);
  }

  async setMasterKeyHash(masterKeyHash: string): Promise<void> {
    await this.masterKeyHashState.update((_) => masterKeyHash);
  }

  async setForceSetPasswordReason(reason: ForceSetPasswordReason): Promise<void> {
    await this.forceSetPasswordReasonState.update((_) => reason);
  }
}

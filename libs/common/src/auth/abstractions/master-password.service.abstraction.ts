import { Observable } from "rxjs";

import { UserId } from "../../types/guid";
import { MasterKey } from "../../types/key";
import { ForceSetPasswordReason } from "../models/domain/force-set-password-reason";

export abstract class MasterPasswordServiceAbstraction {
  forceSetPasswordReason$: Observable<ForceSetPasswordReason>;
  masterKey$: (userId: UserId) => Observable<MasterKey>;
  masterKeyHash$: (userId: UserId) => Observable<string>;
}

export abstract class InternalMasterPasswordServiceAbstraction extends MasterPasswordServiceAbstraction {
  setMasterKey: (masterKey: MasterKey, userId: UserId) => Promise<void>;
  setMasterKeyHash: (masterKeyHash: string, userId: UserId) => Promise<void>;
  setForceSetPasswordReason: (reason: ForceSetPasswordReason) => Promise<void>;
}

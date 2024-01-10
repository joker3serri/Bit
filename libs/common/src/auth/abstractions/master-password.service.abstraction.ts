import { Observable } from "rxjs";

import { MasterKey } from "../../platform/models/domain/symmetric-crypto-key";
import { ForceSetPasswordReason } from "../models/domain/force-set-password-reason";

export abstract class MasterPasswordServiceAbstraction {
  masterKey$: Observable<MasterKey>;
  masterKeyHash$: Observable<string>;
  forceSetPasswordReason$: Observable<ForceSetPasswordReason>;
}

export abstract class InternalMasterPasswordServiceAbstraction extends MasterPasswordServiceAbstraction {
  setMasterKey: (masterKey: MasterKey) => Promise<void>;
  setMasterKeyHash: (masterKeyHash: string) => Promise<void>;
  setForceSetPasswordReason: (reason: ForceSetPasswordReason) => Promise<void>;
}

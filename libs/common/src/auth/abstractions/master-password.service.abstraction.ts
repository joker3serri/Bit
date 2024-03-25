import { Observable } from "rxjs";

import { UserId } from "../../types/guid";
import { MasterKey } from "../../types/key";
import { ForceSetPasswordReason } from "../models/domain/force-set-password-reason";

export abstract class MasterPasswordServiceAbstraction {
  /**
   * An observable that emits if the user is being forced to set a password on login and why.
   * @param userId The user ID.
   */
  abstract forceSetPasswordReason$: (userId: UserId) => Observable<ForceSetPasswordReason>;
  /**
   * An observable that emits the master key for the user.
   * @param userId The user ID.
   */
  abstract masterKey$: (userId: UserId) => Observable<MasterKey>;
  /**
   * An observable that emits the master key hash for the user.
   * @param userId The user ID.
   */
  abstract masterKeyHash$: (userId: UserId) => Observable<string>;
}

export abstract class InternalMasterPasswordServiceAbstraction extends MasterPasswordServiceAbstraction {
  /**
   * Set the master key for the user.
   * @param masterKey The master key.
   * @param userId The user ID.
   */
  abstract setMasterKey: (masterKey: MasterKey, userId: UserId) => Promise<void>;
  /**
   * Set the master key hash for the user.
   * @param masterKeyHash The master key hash.
   * @param userId The user ID.
   */
  abstract setMasterKeyHash: (masterKeyHash: string, userId: UserId) => Promise<void>;
  /**
   * Set the force set password reason for the user.
   * @param reason The reason the user is being forced to set a password.
   * @param userId The user ID.
   */
  abstract setForceSetPasswordReason: (
    reason: ForceSetPasswordReason,
    userId: UserId,
  ) => Promise<void>;
}

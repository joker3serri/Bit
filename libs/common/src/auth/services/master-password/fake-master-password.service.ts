import { mock } from "jest-mock-extended";
import { ReplaySubject, Observable } from "rxjs";

import { UserId } from "../../../types/guid";
import { MasterKey } from "../../../types/key";
import { InternalMasterPasswordServiceAbstraction } from "../../abstractions/master-password.service.abstraction";
import { ForceSetPasswordReason } from "../../models/domain/force-set-password-reason";

export class FakeMasterPasswordService implements InternalMasterPasswordServiceAbstraction {
  mock = mock<InternalMasterPasswordServiceAbstraction>();

  // eslint-disable-next-line rxjs/no-exposed-subjects -- test class
  masterKeySubject = new ReplaySubject<MasterKey>(1);
  // eslint-disable-next-line rxjs/no-exposed-subjects -- test class
  masterKeyHashSubject = new ReplaySubject<string>(1);
  // eslint-disable-next-line rxjs/no-exposed-subjects -- test class
  forceSetPasswordReasonSubject = new ReplaySubject<ForceSetPasswordReason>(1);

  get forceSetPasswordReason$() {
    return this.forceSetPasswordReasonSubject.asObservable();
  }

  constructor(initialMasterKey?: MasterKey, initialMasterKeyHash?: string) {
    this.masterKeySubject.next(initialMasterKey);
    this.masterKeyHashSubject.next(initialMasterKeyHash);
  }

  masterKey$(userId: UserId): Observable<MasterKey> {
    return this.masterKeySubject.asObservable();
  }

  setMasterKey(masterKey: MasterKey, userId: UserId): Promise<void> {
    return this.mock.setMasterKey(masterKey, userId);
  }

  masterKeyHash$(userId: UserId): Observable<string> {
    return this.masterKeyHashSubject.asObservable();
  }

  setMasterKeyHash(masterKeyHash: string, userId: UserId): Promise<void> {
    return this.mock.setMasterKeyHash(masterKeyHash, userId);
  }

  setForceSetPasswordReason(reason: ForceSetPasswordReason): Promise<void> {
    return this.mock.setForceSetPasswordReason(reason);
  }
}

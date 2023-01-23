import { Subject } from "rxjs";

import { SyncEventArgs } from "../../types/syncEventArgs";
import { SyncNotifierService as SyncNotifierServiceAbstraction } from "../../vault/abstractions/sync/syncNotifier.service.abstraction";

/**
 * This class should most likely have 0 dependencies because it will hopefully
 * be rolled into SyncService once upon a time.
 */
export class SyncNotifierService implements SyncNotifierServiceAbstraction {
  private _sync = new Subject<SyncEventArgs>();

  sync$ = this._sync.asObservable();

  next(event: SyncEventArgs): void {
    this._sync.next(event);
  }
}

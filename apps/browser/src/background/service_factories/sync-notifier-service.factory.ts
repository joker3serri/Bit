import { SyncNotifierService } from "@bitwarden/common/services/sync/syncNotifier.service";
import { SyncNotifierService as AbstractSyncNotifierService } from "@bitwarden/common/vault/abstractions/sync/syncNotifier.service.abstraction";

import { FactoryOptions, CachedServices, factory } from "./factory-options";

type SyncNotifierServiceFactoryOptions = FactoryOptions;

export type SyncNotifierServiceInitOptions = SyncNotifierServiceFactoryOptions;

export function syncNotifierServiceFactory(
  cache: { syncNotifierService?: AbstractSyncNotifierService } & CachedServices,
  opts: SyncNotifierServiceInitOptions
): Promise<AbstractSyncNotifierService> {
  return factory(cache, "syncNotifierService", opts, () =>
    Promise.resolve(new SyncNotifierService())
  );
}

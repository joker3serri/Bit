import { VaultTimeoutActionService as AbstractVaultTimeoutActionService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutAction.service";
import { VaultTimeoutActionService } from "@bitwarden/common/services/vaultTimeout/vaultTimeoutAction.service";

import { cipherServiceFactory, CipherServiceInitOptions } from "./cipher-service.factory";
import {
  collectionServiceFactory,
  CollectionServiceInitOptions,
} from "./collection-service.factory";
import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { folderServiceFactory, FolderServiceInitOptions } from "./folder-service.factory";
import {
  keyConnectorServiceFactory,
  KeyConnectorServiceInitOptions,
} from "./key-connector-service.factory";
import { messagingServiceFactory, MessagingServiceInitOptions } from "./messaging-service.factory";
import { searchServiceFactory, SearchServiceInitOptions } from "./search-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";
import {
  vaultTimeoutSettingsServiceFactory,
  VaultTimeoutSettingsServiceInitOptions,
} from "./vault-timeout-settings-service.factory";

type VaultTimeoutActionServiceFactoryOptions = FactoryOptions & {
  vaultTimeoutServiceOptions: {
    lockedCallback: (userId?: string) => Promise<void>;
    loggedOutCallback: (expired: boolean, userId?: string) => Promise<void>;
  };
};

export type VaultTimeoutActionServiceInitOptions = VaultTimeoutActionServiceFactoryOptions &
  CipherServiceInitOptions &
  FolderServiceInitOptions &
  CollectionServiceInitOptions &
  CryptoServiceInitOptions &
  MessagingServiceInitOptions &
  SearchServiceInitOptions &
  KeyConnectorServiceInitOptions &
  StateServiceInitOptions &
  VaultTimeoutSettingsServiceInitOptions;

export function vaultTimeoutActionServiceFactory(
  cache: { vaultTimeoutActionService?: AbstractVaultTimeoutActionService } & CachedServices,
  opts: VaultTimeoutActionServiceInitOptions
): Promise<AbstractVaultTimeoutActionService> {
  return factory(
    cache,
    "vaultTimeoutActionService",
    opts,
    async () =>
      new VaultTimeoutActionService(
        await cipherServiceFactory(cache, opts),
        await folderServiceFactory(cache, opts),
        await collectionServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
        await messagingServiceFactory(cache, opts),
        await searchServiceFactory(cache, opts),
        await keyConnectorServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await vaultTimeoutSettingsServiceFactory(cache, opts),
        opts.vaultTimeoutServiceOptions.lockedCallback,
        opts.vaultTimeoutServiceOptions.loggedOutCallback
      )
  );
}

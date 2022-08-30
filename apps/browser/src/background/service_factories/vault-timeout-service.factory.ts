import { VaultTimeoutService as AbstractVaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";

import VaultTimeoutService from "../../services/vaultTimeout/vaultTimeout.service";

import { authServiceFactory, AuthServiceInitOptions } from "./auth-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  platformUtilsServiceFactory,
  PlatformUtilsServiceInitOptions,
} from "./platform-utils-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";
import {
  vaultTimeoutActionServiceFactory,
  VaultTimeoutActionServiceInitOptions,
} from "./vault-timeout-action-service.factory";
import {
  vaultTimeoutSettingsServiceFactory,
  VaultTimeoutSettingsServiceInitOptions,
} from "./vault-timeout-settings-service.factory";

type VaultTimeoutServiceFactoryOptions = FactoryOptions;

export type VaultTimeoutServiceInitOptions = VaultTimeoutServiceFactoryOptions &
  PlatformUtilsServiceInitOptions &
  StateServiceInitOptions &
  AuthServiceInitOptions &
  VaultTimeoutSettingsServiceInitOptions &
  VaultTimeoutActionServiceInitOptions;

export function vaultTimeoutServiceFactory(
  cache: { vaultTimeoutService?: AbstractVaultTimeoutService } & CachedServices,
  opts: VaultTimeoutServiceInitOptions
): Promise<AbstractVaultTimeoutService> {
  return factory(
    cache,
    "vaultTimeoutService",
    opts,
    async () =>
      new VaultTimeoutService(
        await platformUtilsServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await authServiceFactory(cache, opts),
        await vaultTimeoutSettingsServiceFactory(cache, opts),
        await vaultTimeoutActionServiceFactory(cache, opts)
      )
  );
}

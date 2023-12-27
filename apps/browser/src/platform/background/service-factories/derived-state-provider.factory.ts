import { DerivedStateProvider } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- We need the implementation to inject, but generally this should not be accessed
import { DefaultDerivedStateProvider } from "@bitwarden/common/platform/state/implementations/default-derived-state.provider";

import { CachedServices, FactoryOptions, factory } from "./factory-options";
import {
  MemoryStorageServiceInitOptions,
  observableMemoryStorageServiceFactory,
} from "./storage-service.factory";

type DerivedStateProviderFactoryOptions = FactoryOptions;

export type DerivedStateProviderInitOptions = DerivedStateProviderFactoryOptions &
  MemoryStorageServiceInitOptions;

export async function derivedStateProviderFactory(
  cache: { derivedStateProvider?: DerivedStateProvider } & CachedServices,
  opts: DerivedStateProviderInitOptions,
): Promise<DerivedStateProvider> {
  return factory(
    cache,
    "derivedStateProvider",
    opts,
    async () =>
      new DefaultDerivedStateProvider(await observableMemoryStorageServiceFactory(cache, opts)),
  );
}

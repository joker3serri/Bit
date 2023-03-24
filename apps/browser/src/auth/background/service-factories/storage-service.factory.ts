import { AbstractMemoryStorageService } from "@bitwarden/common/abstractions/storage.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../background/service_factories/factory-options";

type StorageServiceFactoryOptions = FactoryOptions;

export type StorageServiceInitOptions = StorageServiceFactoryOptions;

export function storageServiceFactory(
  cache: { storageService?: AbstractMemoryStorageService } & CachedServices,
  opts: StorageServiceInitOptions
): Promise<AbstractMemoryStorageService> {
  return factory(cache, "storageService", opts, async () => new MemoryStorageService());
}

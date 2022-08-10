import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";

import BrowserLocalStorageService from "../../services/browserLocalStorage.service";
import { LocalBackedSessionStorageService } from "../../services/localBackedSessionStorage.service";

import { encryptServiceFactory, EncryptServiceInitOptions } from "./encrypt-service.factory";
import { factory, FactoryOptions } from "./factory-options";
import {
  keyGenerationServiceFactory,
  KeyGenerationServiceInitOptions,
} from "./key-generation-service.factory";

type StorageServiceFactoryOptions = FactoryOptions & {
  instances: {
    diskStorageService?: AbstractStorageService;
    secureStorageService?: AbstractStorageService;
    memoryStorageService?: AbstractStorageService;
  };
};

export type DiskStorageServiceInitOptions = StorageServiceFactoryOptions;
export type SecureStorageServiceInitOptions = StorageServiceFactoryOptions;
export type MemoryStorageServiceInitOptions = StorageServiceFactoryOptions &
  EncryptServiceInitOptions &
  KeyGenerationServiceInitOptions;

export function diskStorageServiceFactory(
  opts: DiskStorageServiceInitOptions
): AbstractStorageService {
  return factory(opts, "diskStorageService", () => new BrowserLocalStorageService());
}

export function secureStorageServiceFactory(
  opts: SecureStorageServiceInitOptions
): AbstractStorageService {
  return factory(opts, "secureStorageService", () => new BrowserLocalStorageService());
}

export function memoryStorageServiceFactory(
  opts: MemoryStorageServiceInitOptions
): AbstractStorageService {
  return factory(opts, "memoryStorageService", () => {
    if (chrome.runtime.getManifest().manifest_version == 3) {
      return new LocalBackedSessionStorageService(
        encryptServiceFactory(opts),
        keyGenerationServiceFactory(opts)
      );
    }
    return new MemoryStorageService();
  });
}

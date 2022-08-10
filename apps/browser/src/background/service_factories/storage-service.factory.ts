import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";

import BrowserLocalStorageService from "../../services/browserLocalStorage.service";
import { LocalBackedSessionStorageService } from "../../services/localBackedSessionStorage.service";

import { encryptServiceFactory, EncryptServiceInitOptions } from "./encrypt-service.factory";
import {
  keyGenerationServiceFactory,
  KeyGenerationServiceInitOptions,
} from "./key-generation-service.factory";

type StorageServiceFactoryOptions = {
  diskStorageService?: AbstractStorageService;
  secureStorageService?: AbstractStorageService;
  memoryStorageService?: AbstractStorageService;
};

export type DiskStorageServiceInitOptions = StorageServiceFactoryOptions;
export type SecureStorageServiceInitOptions = StorageServiceFactoryOptions;
export type MemoryStorageServiceInitOptions = StorageServiceFactoryOptions &
  EncryptServiceInitOptions &
  KeyGenerationServiceInitOptions;

export function diskStorageServiceFactory(
  opts: DiskStorageServiceInitOptions
): AbstractStorageService {
  if (!opts.diskStorageService) {
    opts.diskStorageService = new BrowserLocalStorageService();
  }
  return opts.diskStorageService;
}

export function secureStorageServiceFactory(
  opts: SecureStorageServiceInitOptions
): AbstractStorageService {
  if (!opts.secureStorageService) {
    opts.secureStorageService = new BrowserLocalStorageService();
  }
  return opts.secureStorageService;
}

export function memoryStorageServiceFactory(
  opts: MemoryStorageServiceInitOptions
): AbstractStorageService {
  if (!opts.memoryStorageService) {
    opts.memoryStorageService =
      chrome.runtime.getManifest().manifest_version == 3
        ? new LocalBackedSessionStorageService(
            encryptServiceFactory(opts),
            keyGenerationServiceFactory(opts)
          )
        : new MemoryStorageService();
  }
  return opts.memoryStorageService;
}

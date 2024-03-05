import { InjectionToken } from "@angular/core";

import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/platform/factories/state-factory";

/**
 * For some reason the default InjectionToken implementation doesn't throw if generic types don't match.
 * e.g. This doesn't throw:
 *    const test: InjectionToken<string> = new InjectionToken<number>();
 * Having a property of type T seems to fix this.
 */
export class BitInjectionToken<T> extends InjectionToken<T> {
  protected readonly bitTypeRecord: T;
}

export const WINDOW = new BitInjectionToken<Window>("WINDOW");
export const OBSERVABLE_MEMORY_STORAGE = new BitInjectionToken<
  AbstractMemoryStorageService & ObservableStorageService
>("OBSERVABLE_MEMORY_STORAGE");
export const OBSERVABLE_DISK_STORAGE = new BitInjectionToken<
  AbstractStorageService & ObservableStorageService
>("OBSERVABLE_DISK_STORAGE");
export const OBSERVABLE_DISK_LOCAL_STORAGE = new BitInjectionToken<
  AbstractStorageService & ObservableStorageService
>("OBSERVABLE_DISK_LOCAL_STORAGE");
export const MEMORY_STORAGE = new BitInjectionToken<AbstractMemoryStorageService>("MEMORY_STORAGE");
export const SECURE_STORAGE = new BitInjectionToken<AbstractStorageService>("SECURE_STORAGE");
export const STATE_FACTORY = new BitInjectionToken<StateFactory>("STATE_FACTORY");
export const STATE_SERVICE_USE_CACHE = new BitInjectionToken<boolean>("STATE_SERVICE_USE_CACHE");
export const LOGOUT_CALLBACK = new BitInjectionToken<
  (expired: boolean, userId?: string) => Promise<void>
>("LOGOUT_CALLBACK");
export const LOCKED_CALLBACK = new BitInjectionToken<(userId?: string) => Promise<void>>(
  "LOCKED_CALLBACK",
);
export const LOCALES_DIRECTORY = new BitInjectionToken<string>("LOCALES_DIRECTORY");
export const SYSTEM_LANGUAGE = new BitInjectionToken<string>("SYSTEM_LANGUAGE");
export const LOG_MAC_FAILURES = new BitInjectionToken<string>("LOG_MAC_FAILURES");

import { AccountService } from "../../../auth/abstractions/account.service";
import { EncryptService } from "../../abstractions/encrypt.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { UserState } from "../active-user-state";
import { KeyDefinition } from "../key-definition";
import { StorageLocation } from "../state-definition";
import { UserStateProvider } from "../user-state.provider";

import { DefaultActiveUserState } from "./default-active-user-state";

export class DefaultUserStateProvider implements UserStateProvider {
  private userStateCache: Record<string, UserState<unknown>> = {};

  constructor(
    protected accountService: AccountService,
    protected encryptService: EncryptService,
    protected memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected diskStorage: AbstractStorageService & ObservableStorageService
  ) {}

  get<T>(keyDefinition: KeyDefinition<T>): UserState<T> {
    const cacheKey = keyDefinition.buildCacheKey();
    const existingUserState = this.userStateCache[cacheKey];
    if (existingUserState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingUserState as DefaultActiveUserState<T>;
    }

    const newUserState = this.buildUserState(keyDefinition);
    this.userStateCache[cacheKey] = newUserState;
    return newUserState;
  }

  protected buildUserState<T>(keyDefinition: KeyDefinition<T>): UserState<T> {
    return new DefaultActiveUserState<T>(
      keyDefinition,
      this.accountService,
      this.encryptService,
      this.getLocation(keyDefinition.stateDefinition.storageLocation)
    );
  }

  private getLocation(location: StorageLocation) {
    switch (location) {
      case "disk":
        return this.diskStorage;
      case "memory":
        return this.memoryStorage;
    }
  }
}

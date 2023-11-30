import { AccountService } from "../../../auth/abstractions/account.service";
import { UserId } from "../../../types/guid";
import { EncryptService } from "../../abstractions/encrypt.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { KeyDefinition } from "../key-definition";
import { StorageLocation } from "../state-definition";
import { ActiveUserState, SingleUserState } from "../user-state";
import { UserStateProvider } from "../user-state.provider";

import { DefaultActiveUserState } from "./default-active-user-state";
import { DefaultSingleUserState } from "./default-single-user-state";

export class DefaultUserStateProvider implements UserStateProvider {
  private activeUserStateCache: Record<string, ActiveUserState<unknown>> = {};
  private singleUserStateCache: Record<string, SingleUserState<unknown>> = {};

  constructor(
    protected accountService: AccountService,
    protected encryptService: EncryptService,
    protected memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    protected diskStorage: AbstractStorageService & ObservableStorageService
  ) {}

  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    const cacheKey = keyDefinition.buildCacheKey("user", "active");
    const existingUserState = this.activeUserStateCache[cacheKey];
    if (existingUserState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingUserState as ActiveUserState<T>;
    }

    const newUserState = this.buildActiveUserState(keyDefinition);
    this.activeUserStateCache[cacheKey] = newUserState;
    return newUserState;
  }

  getFor<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    const cacheKey = keyDefinition.buildCacheKey("user", userId);
    const existingUserState = this.singleUserStateCache[cacheKey];
    if (existingUserState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingUserState as SingleUserState<T>;
    }
  }

  protected buildActiveUserState<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    return new DefaultActiveUserState<T>(
      keyDefinition,
      this.accountService,
      this.encryptService,
      this.getLocation(keyDefinition.stateDefinition.storageLocation)
    );
  }

  protected buildSingleUserState<T>(
    userId: UserId,
    keyDefinition: KeyDefinition<T>
  ): SingleUserState<T> {
    return new DefaultSingleUserState<T>(
      userId,
      keyDefinition,
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

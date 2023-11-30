import { UserId } from "../../types/guid";

import { KeyDefinition } from "./key-definition";
import { ActiveUserState, SingleUserState } from "./user-state";

/**
 * A provider for getting an implementation of user scoped state for the given key.
 */
export abstract class UserStateProvider {
  /**
   * Gets a {@link UserState} scoped to the given {@link KeyDefinition}
   * @param keyDefinition - The {@link KeyDefinition} for which you want the user state for.
   */
  get: <T>(keyDefinition: KeyDefinition<T>) => ActiveUserState<T>;

  getFor: <T>(userId: UserId, keyDefinition: KeyDefinition<T>) => SingleUserState<T>;
}

import { UserId } from "../../types/guid";

import { GlobalState } from "./global-state";
import { KeyDefinition } from "./key-definition";
import { ActiveUserState, SingleUserState } from "./user-state";

/** Convenience wrapper class for {@link ActiveUserStateProvider}, {@link SingleUserStateProvider},
 * and {@link GlobalStateProvider}.
 */
export abstract class StateProvider {
  /** @see{@link ActiveUserStateProvider.get} */
  getActive: <T>(keyDefinition: KeyDefinition<T>) => ActiveUserState<T>;
  /** @see{@link SingleUserStateProvider.get} */
  getUser: <T>(userId: UserId, keyDefinition: KeyDefinition<T>) => SingleUserState<T>;
  /** @see{@link GlobalStateProvider.get} */
  getGlobal: <T>(keyDefinition: KeyDefinition<T>) => GlobalState<T>;
}

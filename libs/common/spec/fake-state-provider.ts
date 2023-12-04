import {
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
  ActiveUserState,
  UserStateProvider,
  SingleUserState,
} from "../src/platform/state";
import { UserId } from "../src/types/guid";

import { FakeActiveUserState, FakeGlobalState, FakeSingleUserState } from "./fake-state";

export class FakeGlobalStateProvider implements GlobalStateProvider {
  states: Map<KeyDefinition<unknown>, GlobalState<unknown>> = new Map();
  get<T>(keyDefinition: KeyDefinition<T>): GlobalState<T> {
    let result = this.states.get(keyDefinition) as GlobalState<T>;

    if (result == null) {
      result = new FakeGlobalState<T>();
      this.states.set(keyDefinition, result);
    }
    return result;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeGlobalState<T> {
    const key = Array.from(this.states.keys()).find(
      (k) => k.stateDefinition === keyDefinition.stateDefinition && k.key === keyDefinition.key,
    );
    return this.get(key) as FakeGlobalState<T>;
  }
}

export class FakeUserStateProvider implements UserStateProvider {
  activeStates: Map<string, ActiveUserState<unknown>> = new Map();
  singleStates: Map<string, SingleUserState<unknown>> = new Map();
  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    let result = this.activeStates.get(
      keyDefinition.buildCacheKey("user", "active"),
    ) as ActiveUserState<T>;

    if (result == null) {
      result = new FakeActiveUserState<T>();
      this.activeStates.set(keyDefinition.buildCacheKey("user", "active"), result);
    }
    return result;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeActiveUserState<T> {
    return this.get(keyDefinition) as FakeActiveUserState<T>;
  }

  getFor<T>(userId: UserId, keyDefinition: KeyDefinition<T>): SingleUserState<T> {
    let result = this.singleStates.get(
      keyDefinition.buildCacheKey("user", userId),
    ) as SingleUserState<T>;

    if (result == null) {
      result = new FakeSingleUserState<T>(userId);
      this.singleStates.set(keyDefinition.buildCacheKey("user", userId), result);
    }
    return result;
  }

  getForFake<T>(userId: UserId, keyDefinition: KeyDefinition<T>): FakeSingleUserState<T> {
    return this.getFor(userId, keyDefinition) as FakeSingleUserState<T>;
  }
}

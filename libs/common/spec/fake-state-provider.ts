import {
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
  ActiveUserState,
  UserStateProvider,
} from "../src/platform/state";

import { FakeGlobalState, FakeUserState } from "./fake-state";

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
      (k) => k.stateDefinition === keyDefinition.stateDefinition && k.key === keyDefinition.key
    );
    return this.get(key) as FakeGlobalState<T>;
  }
}

export class FakeUserStateProvider implements UserStateProvider {
  states: Map<KeyDefinition<unknown>, ActiveUserState<unknown>> = new Map();
  get<T>(keyDefinition: KeyDefinition<T>): ActiveUserState<T> {
    let result = this.states.get(keyDefinition) as ActiveUserState<T>;

    if (result == null) {
      result = new FakeUserState<T>();
      this.states.set(keyDefinition, result);
    }
    return result;
  }

  getFake<T>(keyDefinition: KeyDefinition<T>): FakeUserState<T> {
    const key = Array.from(this.states.keys()).find(
      (k) => k.stateDefinition === keyDefinition.stateDefinition && k.key === keyDefinition.key
    );
    return this.get(key) as FakeUserState<T>;
  }
}

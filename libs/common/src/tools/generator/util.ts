import { BehaviorSubject } from "rxjs";

import { SingleUserState, StateProvider, UserKeyDefinition } from "../../platform/state";
import { UserId } from "../../types/guid";

export function clone$PerUserId<Value>(defaultValue: Value) {
  const _subjects = new Map<UserId, BehaviorSubject<Value>>();

  return (key: UserId) => {
    let value = _subjects.get(key);

    if (value === undefined) {
      value = new BehaviorSubject({ ...defaultValue });
      _subjects.set(key, value);
    }

    return value.asObservable();
  };
}

export function sharedByUserId<Value>(create: (userId: UserId) => SingleUserState<Value>) {
  const _subjects = new Map<UserId, SingleUserState<Value>>();

  return (key: UserId) => {
    let value = _subjects.get(key);

    if (value === undefined) {
      value = create(key);
      _subjects.set(key, value);
    }

    return value;
  };
}

export function sharedStateByUserId<Value>(key: UserKeyDefinition<Value>, provider: StateProvider) {
  return (id: UserId) => provider.getUser<Value>(id, key);
}

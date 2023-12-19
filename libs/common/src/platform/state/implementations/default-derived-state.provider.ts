import { Observable } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { DeriveDefinition } from "../derivation-definition";
import { DerivedStateProvider } from "../derived-state.provider";

import { DefaultDerivedUserState } from "./default-derived-state";

export class DefaultDerivedStateProvider implements DerivedStateProvider {
  private cache: Record<
    string,
    DefaultDerivedUserState<unknown, unknown, Record<string, Type<unknown>>>
  > = {};

  constructor(private memoryStorage: AbstractStorageService & ObservableStorageService) {}

  get<TFrom, TTo, TDeps extends Record<string, Type<unknown>>>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: ShapeToInstances<TDeps>,
  ): DefaultDerivedUserState<TFrom, TTo, TDeps> {
    const cacheKey = deriveDefinition.buildCacheKey();
    const existingDerivedState = this.cache[cacheKey];
    if (existingDerivedState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingDerivedState as DefaultDerivedUserState<TFrom, TTo, TDeps>;
    }

    const newDerivedState = this.buildDerivedState(parentState$, deriveDefinition, dependencies);
    this.cache[cacheKey] = newDerivedState;
    return newDerivedState;
  }

  private buildDerivedState<TFrom, TTo, TDeps extends Record<string, Type<unknown>>>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: ShapeToInstances<TDeps>,
  ) {
    return new DefaultDerivedUserState<TFrom, TTo, TDeps>(
      parentState$,
      deriveDefinition,
      this.memoryStorage,
      dependencies,
    );
  }
}

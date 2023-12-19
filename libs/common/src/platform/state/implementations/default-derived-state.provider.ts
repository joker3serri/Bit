import { Observable } from "rxjs";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "../../abstractions/storage.service";
import { DeriveDefinition } from "../derivation-definition";
import { DerivedStateProvider } from "../derived-state.provider";

import { DefaultDerivedUserState } from "./default-derived-state";

export class DefaultDerivedStateProvider implements DerivedStateProvider {
  constructor(private memoryStorage: AbstractStorageService & ObservableStorageService) {}

  get<TFrom, TTo, TDeps extends Record<string, Type<unknown>>>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: ShapeToInstances<TDeps>,
  ): DefaultDerivedUserState<TFrom, TTo, TDeps> {
    return new DefaultDerivedUserState<TFrom, TTo, TDeps>(
      parentState$,
      deriveDefinition,
      this.memoryStorage,
      dependencies,
    );
  }
}

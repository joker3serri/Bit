import { Observable } from "rxjs";

import { DeriveDefinition } from "./derivation-definition";
import { DerivedState } from "./derived-state";

export abstract class DerivedStateProvider {
  get: <TFrom, TTo, TDeps extends Record<string, Type<unknown>>>(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    dependencies: ShapeToInstances<TDeps>,
  ) => DerivedState<TTo>;
}

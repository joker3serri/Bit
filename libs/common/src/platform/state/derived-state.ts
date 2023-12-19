import { Observable } from "rxjs";

export type StateConverter<TFrom extends Array<unknown>, TTo> = (...args: TFrom) => TTo;

export interface DerivedState<T> {
  state$: Observable<T>;
  forceValue(value: T): Promise<T>;
}

// Needs to support dependent services
// Needs to switchMap between emissions
// Needs to skip work until being observed
// Needs to stop work when not observed
// Allow for forced updates to clear out decrypted?

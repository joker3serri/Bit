import { Observable } from "rxjs";

export type StateConverter<TFrom extends Array<unknown>, TTo> = (...args: TFrom) => TTo;

export interface DerivedState<T> {
  state$: Observable<T>;
  forceValue(value: T): Promise<T>;
}

import { from, Observable, of, throwError } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

export type FunctionReturningAwaitable =
  | (() => unknown)
  | (() => Promise<unknown>)
  | (() => Observable<unknown>);

export function functionToObservable(func: FunctionReturningAwaitable): Observable<unknown> {
  let awaitable: unknown;
  let error: unknown;
  try {
    awaitable = func();
  } catch (e) {
    error = e;
  }

  if (error) {
    return throwError(() => error);
  }

  if (Utils.isPromise(awaitable)) {
    return from(awaitable);
  }

  if (awaitable instanceof Observable) {
    return awaitable;
  }

  return of(awaitable);
}

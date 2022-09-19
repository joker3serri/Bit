import { from, Observable, of, switchMap } from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

export type AwaitableFunction =
  | (() => unknown)
  | (() => Promise<unknown>)
  | (() => Observable<unknown>);

export function functionToObservable(func: AwaitableFunction): Observable<unknown> {
  return of(null).pipe(
    switchMap(() => {
      const awaitable = func();

      if (Utils.isPromise(awaitable)) {
        return from(awaitable);
      }

      if (awaitable instanceof Observable) {
        return awaitable;
      }

      return of(awaitable);
    })
  );
}

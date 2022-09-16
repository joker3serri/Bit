import { Directive, Input, OnDestroy } from "@angular/core";
import { FormGroupDirective } from "@angular/forms";
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";

import { Utils } from "@bitwarden/common/misc/utils";

export type BitSubmitHandler =
  | (() => unknown)
  | (() => Promise<unknown>)
  | (() => Observable<unknown>);

@Directive({
  selector: "[formGroup][bitSubmit]",
})
export class BitSubmitDirective implements OnDestroy {
  private destroy$ = new Subject<void>();
  private _loading$ = new BehaviorSubject<boolean>(false);

  @Input("bitSubmit") protected handler: BitSubmitHandler;

  loading$ = this._loading$.asObservable();

  constructor(formGroupDirective: FormGroupDirective) {
    formGroupDirective.ngSubmit
      .pipe(
        tap(() => this._loading$.next(true)),
        switchMap(() => {
          const awaitable = this.handler();

          if (Utils.isPromise(awaitable)) {
            return awaitable;
          }

          if (awaitable instanceof Observable) {
            return awaitable.pipe(
              catchError((err: unknown) => {
                // eslint-disable-next-line no-console
                console.error("Uncaught submit error", err);
                return of(undefined);
              })
            );
          }

          return of();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this._loading$.next(false),
        complete: () => this._loading$.next(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

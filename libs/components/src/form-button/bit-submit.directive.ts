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

import { functionToObservable } from "../utils/function-to-observable";

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
  private _disabled$ = new BehaviorSubject<boolean>(false);

  @Input("bitSubmit") protected handler: BitSubmitHandler;

  readonly loading$ = this._loading$.asObservable();
  readonly disabled$ = this._disabled$.asObservable();

  constructor(formGroupDirective: FormGroupDirective) {
    formGroupDirective.ngSubmit
      .pipe(
        tap(() => (this.loading = true)),
        switchMap(() => {
          return functionToObservable(this.handler).pipe(
            catchError((err: unknown) => {
              // eslint-disable-next-line no-console
              console.error("Uncaught submit error", err);
              return of(undefined);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => (this.loading = false),
        complete: () => (this.loading = false),
      });
  }

  get disabled() {
    return this._disabled$.value;
  }

  set disabled(value: boolean) {
    this._disabled$.next(value);
  }

  get loading() {
    return this._loading$.value;
  }

  set loading(value: boolean) {
    this._loading$.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

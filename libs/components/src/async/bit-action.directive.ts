import { Directive, HostListener, Input, OnDestroy, Optional } from "@angular/core";
import { finalize, Observable, Subject, takeUntil } from "rxjs";

import { ButtonComponent } from "../button";
import { functionToObservable } from "../utils/function-to-observable";

export type BitActionHandler =
  | (() => unknown)
  | (() => Promise<unknown>)
  | (() => Observable<unknown>);

@Directive({
  selector: "[bitAction]",
})
export class BitActionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  @Input("bitAction") protected handler: BitActionHandler;

  constructor(@Optional() private buttonComponent?: ButtonComponent) {}

  get loading() {
    return this.buttonComponent?.loading;
  }

  set loading(value: boolean) {
    if (this.buttonComponent) {
      this.buttonComponent.loading = value;
    }
  }

  @HostListener("click")
  protected async onClick() {
    if (!this.handler) {
      return;
    }

    this.loading = true;

    functionToObservable(this.handler)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

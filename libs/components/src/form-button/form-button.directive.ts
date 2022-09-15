import { Directive, OnDestroy } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { ButtonComponent } from "../button";

import { BitSubmitDirective } from "./async-submit.directive";

@Directive({
  selector: "button[bitFormButton]",
})
export class BitFormButtonDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(submitDirective?: BitSubmitDirective, buttonComponent?: ButtonComponent) {
    if (submitDirective && buttonComponent) {
      submitDirective.loading$
        .pipe(takeUntil(this.destroy$))
        .subscribe((loading) => (buttonComponent.loading = loading));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { Directive, Input, OnDestroy, Optional } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { ButtonLikeComponent } from "../shared/button-like.abstraction";

import { BitSubmitDirective } from "./bit-submit.directive";

import { BitActionDirective } from ".";

@Directive({
  selector: "button[bitFormButton], button[bitFormIconButton]",
})
export class BitFormButtonDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() type: string;

  constructor(
    private buttonComponent: ButtonLikeComponent,
    @Optional() submitDirective?: BitSubmitDirective,
    @Optional() actionDirective?: BitActionDirective
  ) {
    if (submitDirective && buttonComponent) {
      submitDirective.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
        if (this.type === "submit") {
          buttonComponent.loading = loading;
        } else {
          buttonComponent.disabled = loading;
        }
      });

      submitDirective.disabled$.pipe(takeUntil(this.destroy$)).subscribe((disabled) => {
        buttonComponent.disabled = disabled;
      });
    }

    if (submitDirective && actionDirective) {
      actionDirective.loading$.pipe(takeUntil(this.destroy$)).subscribe((disabled) => {
        submitDirective.disabled = disabled;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

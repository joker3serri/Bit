import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive({
  selector: "[formGroup][bitAction]",
})
export class BitActionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

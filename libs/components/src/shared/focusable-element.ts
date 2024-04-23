import { Directive, ElementRef } from "@angular/core";

/**
 * Interface for implementing focusable components. Used by the AutofocusDirective.
 */
export abstract class FocusableElement {
  getFocusTarget: () => HTMLElement;
}

@Directive({
  selector: "[bitFocusableElement]",
  standalone: true,
  providers: [{ provide: FocusableElement, useExisting: FocusableElementDirective }],
})
export class FocusableElementDirective implements FocusableElement {
  constructor(private elementRef: ElementRef) {}

  getFocusTarget() {
    return this.elementRef.nativeElement;
  }
}

import { Directive, ElementRef, HostListener, Renderer2, Self } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "input[appInputStripSpaces]",
})
export class InputStripSpacesDirective {
  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
    @Self() private ngControl: NgControl,
  ) {}

  @HostListener("input") onInput() {
    const value = this.el.nativeElement.value.replace(/\s+/g, "");
    this.renderer.setProperty(this.el.nativeElement, "value", value);
    this.ngControl.control.setValue(value, { emitEvent: false });
  }
}

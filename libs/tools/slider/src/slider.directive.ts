import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from "@angular/core";
import { NgControl } from "@angular/forms";
import { Subscription } from "rxjs";

let nextId = 0;

@Directive({
  selector: "input[toolsSlider]",
  standalone: true,
  exportAs: "toolsSlider",
})
export class ToolsSliderDirective implements OnInit, OnDestroy {
  @Input() min: number = 0;
  @Input() max: number = 100;

  @HostBinding() @Input() id = `tools-slider-${nextId++}`;

  @HostBinding("class") @Input() get classList() {
    return [
      this.hasError ? "tools-range-danger-600" : "tools-range-primary-600",
      "focus:tools-range-primary-700",
      "disabled:tools-range-secondary-600",
      "hover:tools-range-primary-700",
    ].filter((s) => s != "");
  }

  @HostBinding("attr.aria-describedby") ariaDescribedBy: string;
  @HostBinding("attr.aria-invalid") get ariaInvalid() {
    return this.hasError ? true : undefined;
  }

  @HostBinding("attr.type") @Input() type: string = "range";

  @HostListener("input")
  onInput() {
    this.ngControl?.control?.markAsTouched();
  }

  private formControlValueChangesSub: Subscription;

  get hasError() {
    return this.ngControl?.status === "INVALID" && this.ngControl?.touched;
  }

  constructor(
    @Optional() @Self() private ngControl: NgControl,
    private elementRef: ElementRef<HTMLInputElement>,
  ) {}

  initializeTrackColor() {
    this.updateTrackColorOnValueChange(Number(this.elementRef.nativeElement.value));
  }

  ngOnInit() {
    this.initializeTrackColor();

    if (this.ngControl?.control) {
      this.formControlValueChangesSub = this.ngControl.control.valueChanges.subscribe((value) => {
        this.updateTrackColorOnValueChange(value);
      });
    }
  }

  private updateTrackColorOnValueChange(value: number) {
    const progress = ((value - this.min) / (this.max - this.min)) * 100;
    this.elementRef.nativeElement.style.setProperty("--range-fill-value", `${progress}%`);
  }

  ngOnDestroy() {
    if (this.formControlValueChangesSub) {
      this.formControlValueChangesSub.unsubscribe();
    }
  }
}

import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { FormControlModule } from "@bitwarden/components/src/form-control";

import { ToolsSliderDirective } from "./slider.directive";

@Component({
  selector: "tools-slider",
  templateUrl: "./slider.component.html",
  standalone: true,
  imports: [
    JslibModule,
    CommonModule,
    FormControlModule,
    ReactiveFormsModule,
    ToolsSliderDirective,
  ],
  styleUrls: ["./slider.component.css"],
})
export class SliderComponent implements OnInit {
  /**
   * Minimum value for the slider.
   * @default 0
   */
  @Input() min = 0;

  /**
   * Maximum value for the slider.
   */
  @Input({ required: true }) max: number;

  /**
   * Step value for the slider.
   * Specifies the increment between values while sliding or stepping.
   * @default 1
   */
  @Input() step = 1;

  /**
   * Disabled state for the slider.
   * @default false
   */
  @Input() disabled = false;

  /**
   * Initial value for the slider's FormControl.
   * Can be used to set the starting value for the slider component.
   */
  @Input() initialValue: number;

  /**
   * Label for the slider.
   */
  @Input() label: string;

  @ViewChild("rangeSlider", { static: false }) sliderEl: ElementRef<HTMLInputElement>;

  sliderValueControl = new FormControl(0, [this.validateRange.bind(this)]);

  ngOnInit() {
    if (this.initialValue !== undefined) {
      this.sliderValueControl.setValue(this.initialValue);
      // trigger validation immediately if initialValue is provided
      this.sliderValueControl.markAsTouched();
      this.sliderValueControl.markAsDirty();
    } else {
      this.sliderValueControl.setValue(this.max / 2);
    }
  }

  constructor() {}

  validateRange(control: FormControl) {
    const value = control.value;
    if (value < this.min || value > this.max) {
      return { outOfRange: true };
    }
    return null;
  }
}

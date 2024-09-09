import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";

import { ToolsSliderDirective } from "./slider.directive";

@Component({
  selector: "bit-slider",
  templateUrl: "./slider.component.html",
  standalone: true,
  imports: [JslibModule, CommonModule, ReactiveFormsModule, ToolsSliderDirective],
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements AfterViewInit, OnInit {
  @Input() min = 0;
  @Input() max: number;
  @Input() step = 0.1;
  @Input() disabled = false;
  @Input() initialValue: number;

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

  constructor() {
    this.sliderValueControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.setTrackColor(value);
    });
  }

  get roundedSliderValue() {
    return Math.round(this.sliderValueControl.value || 0);
  }

  ngAfterViewInit() {
    this.setTrackColor(this.sliderValueControl.value);
  }

  setTrackColor(value: number) {
    if (!this.sliderEl) {
      return;
    }

    const progress = (value / this.max) * 100;
    this.sliderEl.nativeElement.style.setProperty("--range-fill-value", `${progress}%`);
  }

  validateRange(control: FormControl) {
    const value = control.value;
    if (value < this.min || value > this.max) {
      return { outOfRange: true };
    }
    return null;
  }
}

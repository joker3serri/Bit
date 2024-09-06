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
  imports: [JslibModule, CommonModule, ReactiveFormsModule, ToolsSliderDirective], // Import ReactiveFormsModule here
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements OnInit, AfterViewInit {
  @Input() min = 0;
  @Input() max: number;
  @Input() step = 0.1;
  @Input() disabled = false;

  @ViewChild("rangeSlider", { static: false }) sliderEl: ElementRef<HTMLInputElement>;

  sliderValueControl = new FormControl(0, [this.validateSlider.bind(this)]); // FormControl with custom validation

  ngOnInit() {
    this.sliderValueControl.setValue(this.max / 2); // Set initial value
    // Subscribe to the valueChanges observable of the form control
    this.sliderValueControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.setTrackColor(value);
    });
  }

  ngAfterViewInit() {
    // Ensure the slider element is available after the view has been initialized
    this.setTrackColor(this.sliderValueControl.value);
  }

  setTrackColor(value: number) {
    if (!this.sliderEl) {
      return; // Safety check
    }

    const progress = (value / this.max) * 100;
    this.sliderEl.nativeElement.style.setProperty("--range-fill-value", `${progress}%`);
  }

  // Custom validator that checks if the value is out of range
  validateSlider(control: FormControl) {
    const value = control.value;
    if (value < this.min || value > this.max) {
      return { outOfRange: true };
    }
    return null; // Valid case
  }
}

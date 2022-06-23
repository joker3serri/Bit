import { Component, Input } from "@angular/core";
import { CdkStep } from "@angular/cdk/stepper";

@Component({
  selector: "app-vertical-step",
  templateUrl: "vertical-step.component.html",
  providers: [{ provide: CdkStep, useExisting: VerticalStep }],
})
export class VerticalStep extends CdkStep {
  @Input() subLabel = "";
}

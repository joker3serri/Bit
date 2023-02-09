import { Component, Input } from "@angular/core";

@Component({
  selector: "sm-onboarding-task",
  templateUrl: "./onboarding-task.component.html",
})
export class OnboardingTaskComponent {
  @Input()
  completed = false;

  @Input()
  icon = "bwi-info-circle";

  @Input()
  title: string;

  @Input()
  route: string | any[];
}

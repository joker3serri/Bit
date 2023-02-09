import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from "@angular/core";

import { OnboardingTaskComponent } from "./onboarding-task.component";

@Component({
  selector: "sm-onboarding",
  templateUrl: "./onboarding.component.html",
})
export class OnboardingComponent {
  @ContentChildren(OnboardingTaskComponent) tasks: QueryList<OnboardingTaskComponent>;

  @Input() title: string;

  @Output() onDismiss = new EventEmitter();

  open = true;

  protected get completed(): number {
    return this.tasks.filter((task) => task.completed).length;
  }

  protected get barWidth(): number {
    return (this.completed / this.tasks.length) * 100;
  }

  protected toggle() {
    this.open = !this.open;
  }
}

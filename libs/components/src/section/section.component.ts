import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [ngClass]="sectionClass">
      <ng-content></ng-content>
    </section>
  `,
})
export class SectionComponent {
  @Input({ transform: coerceBooleanProperty }) disableMargin = false;

  get sectionClass() {
    if (this.disableMargin) {
      return [];
    }

    return ["tw-mb-6", "md:tw-mb-12"];
  }
}

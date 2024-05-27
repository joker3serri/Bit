import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "bit-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="tw-mb-6 md:tw-mb-12 tw-group">
      <ng-content></ng-content>
    </section>
  `,
})
export class SectionComponent {}

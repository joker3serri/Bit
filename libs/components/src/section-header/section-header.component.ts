import { Component, Input } from "@angular/core";

import { TypographyModule } from "../typography";

@Component({
  standalone: true,
  selector: "bit-section-header",
  templateUrl: "./section-header.component.html",
  imports: [TypographyModule],
  host: {
    // if we want to use "header has immediate sibling card"
    class: "has-[+_bit-card]:tw-pb-1 tw-block",
  },
})
export class SectionHeaderComponent {
  @Input() title: string;
}

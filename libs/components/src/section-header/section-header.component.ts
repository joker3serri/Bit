import { Component } from "@angular/core";

import { TypographyModule } from "../typography";

@Component({
  standalone: true,
  selector: "bit-section-header",
  templateUrl: "./section-header.component.html",
  imports: [TypographyModule],
  host: {
    class:
      // apply bottom and x-axis padding when a `bit-card` is the immediate sibling, or nested in the immediate sibling
      "has-[+_*_bit-card]:tw-pb-1 has-[+_*_bit-card]:tw-px-1 has-[+_bit-card]:tw-pb-1 has-[+_bit-card]:tw-px-1 tw-block",
  },
})
export class SectionHeaderComponent {}

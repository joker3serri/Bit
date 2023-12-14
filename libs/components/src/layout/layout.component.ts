import { Component, Input } from "@angular/core";

export type LayoutVariant = "primary" | "secondary";

import { LinkModule } from "../link";
import { SharedModule } from "../shared";

@Component({
  selector: "bit-layout",
  templateUrl: "layout.component.html",
  standalone: true,
  imports: [SharedModule, LinkModule],
})
export class LayoutComponent {
  @Input() variant: LayoutVariant = "primary";
}

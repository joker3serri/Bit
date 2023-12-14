import { Component } from "@angular/core";

import { LinkModule } from "../link";
import { SharedModule } from "../shared";

@Component({
  selector: "bit-layout",
  templateUrl: "layout.component.html",
  standalone: true,
  imports: [SharedModule, LinkModule],
})
export class LayoutComponent {}

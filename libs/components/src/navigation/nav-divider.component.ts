import { Component } from "@angular/core";

import { SideNavService } from "../layout/side-nav.service";

@Component({
  selector: "bit-nav-divider",
  templateUrl: "./nav-divider.component.html",
})
export class NavDividerComponent {
  constructor(protected sideNavService: SideNavService) {}
}

import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-tab-nav-bar",
  templateUrl: "tab-nav-bar.component.html",
})
export class TabNavBarComponent {
  @Input() label = "";
}

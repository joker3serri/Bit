import { CommonModule, Location } from "@angular/common";
import { Component, Input } from "@angular/core";

import { TypographyModule } from "@bitwarden/components";

@Component({
  selector: "popup-header",
  templateUrl: "popup-header.component.html",
  standalone: true,
  imports: [TypographyModule, CommonModule],
})
export class PopupHeaderComponent {
  @Input() showBackButton: boolean = false;
  @Input() pageTitle: string;

  constructor(private location: Location) {}

  back() {
    this.location.back();
  }
}

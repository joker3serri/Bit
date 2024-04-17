import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { AvatarModule } from "@bitwarden/components/src/avatar";
import { ButtonModule } from "@bitwarden/components/src/button";
import { IconButtonModule } from "@bitwarden/components/src/icon-button";
import { TypographyModule } from "@bitwarden/components/src/typography";

@Component({
  selector: "popup-header",
  templateUrl: "popup-header.component.html",
  standalone: true,
  imports: [TypographyModule, CommonModule, AvatarModule, ButtonModule, IconButtonModule],
})
export class PopupHeaderComponent {
  @Input() variant: "top-level" | "top-level-action" | "sub-page" = "top-level-action";
  @Input() pageTitle: string;
  // Not the best solution
  @Input() poppedOut: boolean = false;
  // TODO avatar Input
  // TODO button functionality
}

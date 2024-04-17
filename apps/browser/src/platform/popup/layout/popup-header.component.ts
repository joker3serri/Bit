import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import {
  AvatarModule,
  ButtonModule,
  IconButtonModule,
  TypographyModule,
} from "@bitwarden/components";

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

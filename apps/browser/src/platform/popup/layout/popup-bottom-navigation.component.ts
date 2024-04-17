import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

import { LinkModule } from "@bitwarden/components";

@Component({
  selector: "popup-bottom-navigation",
  templateUrl: "popup-bottom-navigation.component.html",
  standalone: true,
  imports: [CommonModule, LinkModule, RouterModule],
})
export class PopupBottomNavigationComponent {
  // TODO button functionality

  navButtons = [
    {
      label: "Vault",
      page: "vault",
      iconKey: "lock",
    },
    {
      label: "Generatorbutverylongversion",
      page: "generator",
      iconKey: "generate",
    },
    {
      label: "Send",
      page: "send",
      iconKey: "send",
    },
    {
      label: "Settings",
      page: "settings",
      iconKey: "cog",
    },
  ];
}

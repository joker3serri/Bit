import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

import { LinkModule } from "@bitwarden/components";

@Component({
  selector: "popup-tab-navigation",
  templateUrl: "popup-tab-navigation.component.html",
  standalone: true,
  imports: [CommonModule, LinkModule, RouterModule],
  host: {
    class: "tw-block tw-h-full tw-w-full tw-flex tw-flex-col",
  },
})
export class PopupTabNavigationComponent {
  navButtons = [
    {
      label: "Vault",
      page: "vault",
      iconKey: "lock",
    },
    {
      label: "Generator",
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

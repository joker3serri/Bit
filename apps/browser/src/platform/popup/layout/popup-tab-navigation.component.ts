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
      page: "/vault",
      iconKey: "lock",
      iconKeyActive: "lock-f",
    },
    {
      label: "Generator",
      page: "/generator",
      iconKey: "generate",
      iconKeyActive: "generate-f",
    },
    {
      label: "Send",
      page: "/send",
      iconKey: "send",
      iconKeyActive: "send-f",
    },
    {
      label: "Settings",
      page: "/settings",
      iconKey: "cog",
      iconKeyActive: "cog-f",
    },
  ];
}

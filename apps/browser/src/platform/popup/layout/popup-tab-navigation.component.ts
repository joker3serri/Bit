import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterModule } from "@angular/router";
import { combineLatest } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { LinkModule } from "@bitwarden/components";
import { SendItemsService } from "@bitwarden/send-ui";

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
      page: "/tabs/vault",
      iconKey: "lock",
      iconKeyActive: "lock-f",
    },
    {
      label: "Generator",
      page: "/tabs/generator",
      iconKey: "generate",
      iconKeyActive: "generate-f",
    },
    {
      label: "Send",
      page: "/tabs/send",
      iconKey: "send",
      iconKeyActive: "send-f",
    },
    {
      label: "Settings",
      page: "/tabs/settings",
      iconKey: "cog",
      iconKeyActive: "cog-f",
    },
  ];

  sendsDisabled = false;
  protected sends$ = this.sendItemsService.filteredAndSortedSends$;

  constructor(
    private policyService: PolicyService,
    private sendItemsService: SendItemsService,
  ) {
    combineLatest([
      this.sendItemsService.filteredAndSortedSends$,
      this.policyService.policyAppliesToActiveUser$(PolicyType.DisableSend),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([sends, policyAppliesToActiveUser]) => {
        if (policyAppliesToActiveUser && sends.length === 0) {
          this.navButtons = this.navButtons.filter((b) => b.page !== "/tabs/send");
        }
      });
  }
}

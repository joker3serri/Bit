import { Component, HostListener, QueryList, ViewChildren } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "@bitwarden/angular/vault/vault-filter/components/vault-filter.component";

import { StatusFilterComponent } from "./filters/status-filter.component";

@Component({
  selector: "app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {
  @ViewChildren(StatusFilterComponent) components!: QueryList<StatusFilterComponent>;

  protected getButtons(): HTMLElement[] {
    return [...document.getElementsByClassName("filter-button")] as HTMLElement[];
  }

  protected currentButtonIndex(buttons: HTMLElement[]) {
    return buttons.findIndex((button) => button.getAttribute("aria-pressed") == "true");
  }

  @HostListener("window:keydown", ["$event"])
  async handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.code == "ArrowUp") {
      const buttons = this.getButtons();
      const current = this.currentButtonIndex(buttons);

      if (current > 0) {
        buttons[current - 1].click();
      }
    } else if (event.ctrlKey && event.code == "ArrowDown") {
      const buttons = this.getButtons();
      const current = this.currentButtonIndex(buttons);

      if (current >= 0 && current + 1 < buttons.length) {
        buttons[current + 1].click();
      }
    }
  }
}

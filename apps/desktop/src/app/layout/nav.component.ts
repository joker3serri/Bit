import { Component, HostListener } from "@angular/core";
import { Router } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

@Component({
  selector: "app-nav",
  templateUrl: "nav.component.html",
})
export class NavComponent {
  items: any[] = [
    {
      link: "/vault",
      icon: "bwi-lock-f",
      label: this.i18nService.translate("myVault"),
    },
    {
      link: "/send",
      icon: "bwi-send-f",
      label: "Send",
    },
  ];

  constructor(private i18nService: I18nService, private router: Router) {}

  @HostListener("window:keydown", ["$event"])
  async handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.code == "ArrowLeft") {
      this.navigateToPrevious();
    } else if (event.ctrlKey && event.code == "ArrowRight") {
      this.navigateToNext();
    }
  }

  protected navigateToPrevious() {
    const index = this.currentItemIndex();
    if (index <= 0) {
      return;
    }

    this.router.navigate([this.items[index - 1].link]);
  }

  protected navigateToNext() {
    const index = this.currentItemIndex();
    if (index < 0 || index + 1 >= this.items.length) {
      return;
    }

    this.router.navigate([this.items[index + 1].link]);
  }

  protected currentItemIndex() {
    return this.items.findIndex((item) => this.router.url.startsWith(item.link));
  }
}

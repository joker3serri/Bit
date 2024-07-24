import { CommonModule } from "@angular/common";
import { Component, ContentChild, Input, inject, signal } from "@angular/core";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { PopupHeaderComponent } from "./popup-header.component";

@Component({
  selector: "popup-page",
  templateUrl: "popup-page.component.html",
  standalone: true,
  host: {
    class: "tw-h-full tw-flex tw-flex-col tw-flex-1 tw-overflow-y-hidden",
  },
  imports: [CommonModule],
})
export class PopupPageComponent {
  protected i18nService = inject(I18nService);

  @Input() loading = false;

  @ContentChild(PopupHeaderComponent)
  header: PopupHeaderComponent;

  protected scrolled = signal(false);

  /** Accessible loading label for the spinner. Defaults to "loading" */
  @Input() loadingText?: string = this.i18nService.t("loading");

  handleScroll(event: Event) {
    this.scrolled.set((event.currentTarget as HTMLElement).scrollTop !== 0);
  }
}

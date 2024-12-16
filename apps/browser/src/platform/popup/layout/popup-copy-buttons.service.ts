import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import { GlobalStateProvider, KeyDefinition, THEMING_DISK } from "@bitwarden/common/platform/state";
import { CopyButtonsService } from "@bitwarden/components";

const COPY_BUTTON = new KeyDefinition<boolean>(THEMING_DISK, "copyButtons", {
  deserializer: (s) => s,
});

/**
 * Service to persist Copy Buttons to state / user settings.
 **/
@Injectable({ providedIn: "root" })
export class PopupCopyButtonsService implements CopyButtonsService {
  private state = inject(GlobalStateProvider).get(COPY_BUTTON);

  enabled$: Observable<boolean> = this.state.state$.pipe(map((state) => state ?? false));

  init() {
    this.enabled$.subscribe((enabled) => {
      enabled
        ? document.body.classList.add("tw-bit-copy-buttons")
        : document.body.classList.remove("tw-bit-copy-buttons");
    });
  }

  async setEnabled(enabled: boolean) {
    await this.state.update(() => enabled);
  }
}

import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule, DialogModule, DialogService } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-vault-ui-onboarding",
  template: `
    <bit-simple-dialog>
      <div bitDialogIcon>
        <img src="../../../../../images/announcement.svg" alt="" />
      </div>
      <span bitDialogTitle>
        {{ "bitwardenNewLook" | i18n }}
      </span>
      <span bitDialogContent>
        {{ "bitwardenNewLookDesc" | i18n }}
      </span>

      <ng-container bitDialogFooter>
        <a
          bitButton
          href="https://bitwarden.com/help/vault-ui/"
          target="_blank"
          rel="noreferrer"
          buttonType="primary"
          bitDialogClose
        >
          {{ "learnMore" | i18n }}
          <i class="bwi bwi-external-link bwi-fw" aria-hidden="true"></i>
        </a>
        <button bitButton type="button" buttonType="secondary" bitDialogClose>
          {{ "close" | i18n }}
        </button>
      </ng-container>
    </bit-simple-dialog>
  `,
  imports: [CommonModule, DialogModule, ButtonModule, JslibModule],
})
export class VaultUiOnboardingComponent {
  static open(dialogService: DialogService) {
    return dialogService.open<boolean>(VaultUiOnboardingComponent);
  }
}

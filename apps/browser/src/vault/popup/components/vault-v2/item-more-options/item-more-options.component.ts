import { CommonModule } from "@angular/common";
import { booleanAttribute, Component, Input } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { IconButtonModule, ItemModule, MenuModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-item-more-options",
  templateUrl: "./item-more-options.component.html",
  imports: [ItemModule, IconButtonModule, MenuModule, CommonModule, JslibModule],
})
export class ItemMoreOptionsComponent {
  @Input({
    required: true,
  })
  cipher: CipherView;

  /**
   * Flag to show the autofill menu options. Used for login items that are not
   * already in the autofill list suggestion.
   */
  @Input({ transform: booleanAttribute })
  showAutofillOptions: boolean;

  get canEdit() {
    return this.cipher.edit;
  }

  get isLogin() {
    return this.cipher.type === CipherType.Login;
  }
}

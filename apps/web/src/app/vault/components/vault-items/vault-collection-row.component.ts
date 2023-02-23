import { Component, Input } from "@angular/core";

import { CollectionView } from "@bitwarden/common/models/view/collection.view";

@Component({
  selector: "tr[appVaultCollectionRow]",
  templateUrl: "vault-collection-row.component.html",
})
export class VaultCollectionRowComponent {
  @Input() collection: CollectionView;
}

import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";

import { CollectionAdminView, GroupView } from "../../../organizations/core";

import { VaultItemEvent } from "./vault-item-event";

@Component({
  selector: "tr[appVaultCollectionRow]",
  templateUrl: "vault-collection-row.component.html",
})
export class VaultCollectionRowComponent {
  @Input() collection: CollectionView;
  @Input() showOwner: boolean;
  @Input() showCollections: boolean;
  @Input() showGroups: boolean;
  @Input() editable: boolean;
  @Input() organizations: Organization[];
  @Input() groups: GroupView[];

  @Output() onEvent = new EventEmitter<VaultItemEvent>();

  get collectionGroups() {
    if (!(this.collection instanceof CollectionAdminView)) {
      return [];
    }

    return this.collection.groups;
  }
}

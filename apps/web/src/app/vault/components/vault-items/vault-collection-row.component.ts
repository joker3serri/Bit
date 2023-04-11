import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { CollectionView } from "@bitwarden/common/admin-console/models/view/collection.view";

import { CollectionAdminView, GroupView } from "../../../admin-console/organizations/core";

import { VaultItemEvent } from "./vault-item-event";
import { RowHeightClass } from "./vault-items.component";

@Component({
  selector: "tr[appVaultCollectionRow]",
  templateUrl: "vault-collection-row.component.html",
})
export class VaultCollectionRowComponent {
  protected RowHeightClass = RowHeightClass;

  @Input() disabled: boolean;
  @Input() collection: CollectionView;
  @Input() showOwner: boolean;
  @Input() showCollections: boolean;
  @Input() showGroups: boolean;
  @Input() canEditCollection: boolean;
  @Input() canDeleteCollection: boolean;
  @Input() organizations: Organization[];
  @Input() groups: GroupView[];

  @Output() onEvent = new EventEmitter<VaultItemEvent>();

  @Input() checked: boolean;
  @Output() checkedToggled = new EventEmitter<void>();

  get collectionGroups() {
    if (!(this.collection instanceof CollectionAdminView)) {
      return [];
    }

    return this.collection.groups;
  }

  get organization() {
    return this.organizations.find((o) => o.id === this.collection.organizationId);
  }

  protected edit() {
    this.onEvent.next({ type: "edit", item: this.collection });
  }

  protected access() {
    this.onEvent.next({ type: "viewAccess", item: this.collection });
  }

  protected deleteCollection() {
    this.onEvent.next({ type: "delete", items: [{ collection: this.collection }] });
  }
}

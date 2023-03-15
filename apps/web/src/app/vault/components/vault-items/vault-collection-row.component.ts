import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";

import { CollectionAdminView, GroupView } from "../../../organizations/core";

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
  @Input() editable: boolean;
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

  protected get canEditCollection(): boolean {
    if (!(this.collection instanceof CollectionAdminView)) {
      return false;
    }

    const organization = this.organization;

    // Only edit collection if it is editable and not deleting "Unassigned"
    if (!this.editable || this.collection.id == undefined) {
      return false;
    }

    // Otherwise, check if we can edit the specified collection
    return (
      organization?.canEditAnyCollection ||
      (organization?.canEditAssignedCollections && this.collection.assigned)
    );
  }

  protected get canDeleteCollection(): boolean {
    if (!(this.collection instanceof CollectionAdminView)) {
      return false;
    }

    const organization = this.organization;

    // Only delete collection if it is editable and not deleting "Unassigned"
    if (!this.editable || this.collection.id == undefined) {
      return false;
    }

    // Otherwise, check if we can delete the specified collection
    return (
      organization?.canDeleteAnyCollection ||
      (organization?.canDeleteAssignedCollections && this.collection.assigned)
    );
  }

  protected edit() {
    this.onEvent.next({ type: "edit", item: this.collection });
  }

  protected access() {
    this.onEvent.next({ type: "access", item: this.collection });
  }

  protected deleteCollection() {
    this.onEvent.next({ type: "delete", items: [{ collection: this.collection }] });
  }
}

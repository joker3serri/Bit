import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { TableDataSource } from "@bitwarden/components";

import { GroupView } from "../../../organizations/core";

import { VaultItem } from "./vault-item";
import { VaultItemEvent } from "./vault-item-event";

@Component({
  selector: "app-new-vault-items",
  templateUrl: "vault-items.component.html",
  // TODO: Improve change detection, see: https://bitwarden.atlassian.net/browse/TDL-220
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultItemsComponent {
  @Input() disabled: boolean;
  @Input() showOwner: boolean;
  @Input() showCollections: boolean;
  @Input() showGroups: boolean;
  @Input() useEvents: boolean;
  @Input() editableCollections: boolean;
  @Input() cloneableOrganizationCiphers: boolean;
  @Input() showPremiumFeatures: boolean;
  @Input() showBulkMove: boolean;
  @Input() showBulkTrashOptions: boolean;
  @Input() allOrganizations: Organization[];
  @Input() allCollections: CollectionView[];
  @Input() allGroups: GroupView[];

  private _ciphers: CipherView[] = [];
  @Input() get ciphers(): CipherView[] {
    return this._ciphers;
  }
  set ciphers(value: CipherView[]) {
    this._ciphers = value;
    this.refreshItems();
  }

  private _collections: CollectionView[] = [];
  @Input() get collections(): CollectionView[] {
    return this._collections;
  }
  set collections(value: CollectionView[]) {
    this._collections = value;
    this.refreshItems();
  }

  @Output() onEvent = new EventEmitter<VaultItemEvent>();

  protected dataSource = new TableDataSource<VaultItem>();
  protected selection = new SelectionModel<VaultItem>(true, [], true);

  get isAllSelected() {
    return this.dataSource.data.every((item) => this.selection.isSelected(item));
  }

  toggleAll() {
    this.isAllSelected ? this.selection.clear() : this.selection.select(...this.dataSource.data);
  }

  protected event(event: VaultItemEvent) {
    this.onEvent.emit(event);
  }

  protected bulkMoveToFolder() {
    this.event({
      type: "moveToFolder",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }

  protected bulkMoveToOrganization() {
    this.event({
      type: "moveToOrganization",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }

  protected bulkRestore() {
    this.event({
      type: "restore",
      items: this.selection.selected
        .filter((item) => item.cipher !== undefined)
        .map((item) => item.cipher),
    });
  }

  protected bulkDelete() {
    this.event({
      type: "delete",
      items: this.selection.selected,
    });
  }

  private refreshItems() {
    const collections: VaultItem[] = this.collections.map((collection) => ({ collection }));
    const ciphers: VaultItem[] = this.ciphers.map((cipher) => ({ cipher }));
    const items = [].concat(collections).concat(ciphers);

    this.selection.clear();
    this.dataSource.data = items;
  }
}

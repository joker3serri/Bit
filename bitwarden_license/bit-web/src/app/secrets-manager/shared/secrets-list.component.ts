import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { SecretListItemActionsView } from "../models/view/secret-list-item-actions.view";
import { SecretListNoItemsView } from "../models/view/secret-list-no-items.view";
import { SecretListView } from "../models/view/secret-list.view";

@Component({
  selector: "sm-secrets-list",
  templateUrl: "./secrets-list.component.html",
})
export class SecretsListComponent implements OnDestroy {
  @Input()
  get secrets(): SecretListView[] {
    return this._secrets;
  }
  set secrets(secrets: SecretListView[]) {
    this.selection.clear();
    this._secrets = secrets;
  }
  private _secrets: SecretListView[];

  @Input()
  protected itemActions: SecretListItemActionsView;

  @Input()
  protected noItemsView: SecretListNoItemsView;

  @Output() editSecretEvent = new EventEmitter<string>();
  @Output() copySecretNameEvent = new EventEmitter<string>();
  @Output() copySecretValueEvent = new EventEmitter<string>();
  @Output() projectsEvent = new EventEmitter<string>();
  @Output() onSecretCheckedEvent = new EventEmitter<string[]>();
  @Output() deleteSecretsEvent = new EventEmitter<string[]>();
  @Output() newSecretEvent = new EventEmitter();

  private destroy$: Subject<void> = new Subject<void>();

  selection = new SelectionModel<string>(true, []);

  constructor() {
    this.selection.changed
      .pipe(takeUntil(this.destroy$))
      .subscribe((_) => this.onSecretCheckedEvent.emit(this.selection.selected));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.secrets.length;
    return numSelected === numRows;
  }

  toggleAll() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.secrets.map((s) => s.id));
  }

  bulkDeleteSecrets() {
    if (this.selection.selected.length >= 1) {
      this.deleteSecretsEvent.emit(this.selection.selected);
    }
  }
}

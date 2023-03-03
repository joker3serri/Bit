import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { TableDataSource } from "@bitwarden/components";

import { ServiceAccountView } from "../models/view/service-account.view";

@Component({
  selector: "sm-service-accounts-list",
  templateUrl: "./service-accounts-list.component.html",
})
export class ServiceAccountsListComponent implements OnDestroy {
  protected dataSource = new TableDataSource<ServiceAccountView>();

  @Input()
  get serviceAccounts(): ServiceAccountView[] {
    return this._serviceAccounts;
  }
  set serviceAccounts(serviceAccounts: ServiceAccountView[]) {
    this.selection.clear();
    this._serviceAccounts = serviceAccounts;
    this.dataSource.data = serviceAccounts;
  }
  private _serviceAccounts: ServiceAccountView[];

  @Input()
  set search(search: string) {
    this.dataSource.filter = search;
  }

  @Output() newServiceAccountEvent = new EventEmitter();
  @Output() deleteServiceAccountsEvent = new EventEmitter<string[]>();
  @Output() onServiceAccountCheckedEvent = new EventEmitter<string[]>();

  private destroy$: Subject<void> = new Subject<void>();

  selection = new SelectionModel<string>(true, []);

  constructor() {
    this.selection.changed
      .pipe(takeUntil(this.destroy$))
      .subscribe((_) => this.onServiceAccountCheckedEvent.emit(this.selection.selected));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.serviceAccounts.length;
    return numSelected === numRows;
  }

  toggleAll() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.serviceAccounts.map((s) => s.id));
  }

  bulkDeleteServiceAccounts() {
    if (this.selection.selected.length >= 1) {
      this.deleteServiceAccountsEvent.emit(this.selection.selected);
    }
  }
}

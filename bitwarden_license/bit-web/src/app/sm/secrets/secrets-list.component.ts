import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { SecretResponse } from "./Responses/secretResponse";

@Component({
  selector: "sm-secrets-list",
  templateUrl: "./secrets-list.component.html",
})
export class SecretsListComponent implements OnDestroy {
  @Input() secrets: SecretResponse[];

  @Output() editSecretEvent = new EventEmitter<string>();
  @Output() copySecretKeyEvent = new EventEmitter<string>();
  @Output() copySecretValueEvent = new EventEmitter<string>();
  @Output() projectsEvent = new EventEmitter<string>();
  @Output() deleteSecretEvent = new EventEmitter<string>();
  @Output() onSecretCheckedEvent = new EventEmitter<string[]>();

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
}

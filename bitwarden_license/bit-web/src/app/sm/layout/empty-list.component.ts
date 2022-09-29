import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { DialogService } from "@bitwarden/components";

import {
  OperationType,
  SecretDialogComponent,
  SecretOperation,
} from "../secrets/dialog/secret-dialog.component";

export enum SecretManagerType {
  Secret,
  Project,
  ServiceAccount,
}

@Component({
  selector: "sm-empty-list",
  templateUrl: "./empty-list.component.html",
})
export class EmptyListComponent implements OnInit, OnDestroy {
  @Input() secretManagerType: SecretManagerType;
  @Input() emptyListTitle: string;
  @Input() emptyListContent: string;
  @Input() showImportSecrets: boolean;

  private organizationId: string;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private dialogService: DialogService) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.organizationId = params.organizationId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get newButtonTitle() {
    if (this.secretManagerType == SecretManagerType.Secret) {
      return "newSecret";
    } else if (this.secretManagerType == SecretManagerType.ServiceAccount) {
      return "newServiceAccount";
    } else {
      return "newProject";
    }
  }

  launchNewDialog() {
    if (this.secretManagerType == SecretManagerType.Secret) {
      this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
        data: {
          organizationId: this.organizationId,
          operation: OperationType.Add,
        },
      });
    } else if (this.secretManagerType == SecretManagerType.ServiceAccount) {
      // TODO launch new service account dialog once implemented.
    } else {
      // TODO launch new project account dialog once implemented.
    }
  }

  launchImportSecrets() {
    // TODO launch import secrets dialog once implemented.
    return;
  }
}

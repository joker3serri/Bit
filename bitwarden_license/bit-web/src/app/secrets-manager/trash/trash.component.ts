import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { SecretListView } from "../models/view/secret-list.view";
import {
  SecretDeleteDialogComponent,
  SecretDeleteOperation,
} from "../secrets/dialog/secret-delete.component";
import {
  SecretRestoreDialogComponent,
  SecretRestoreOperation,
} from "../secrets/dialog/secret-restore.component";
import { SecretService } from "../secrets/secret.service";

@Component({
  selector: "sm-trash",
  templateUrl: "./trash.component.html",
})
export class TrashComponent implements OnInit {
  secrets$: Observable<SecretListView[]>;

  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private secretService: SecretService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.secrets$ = this.secretService.secret$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        this.organizationId = params.organizationId;
        return await this.getSecrets();
      })
    );
  }

  private async getSecrets(): Promise<SecretListView[]> {
    return await this.secretService.getTrashedSecrets(this.organizationId);
  }

  openDeleteSecret(secretIds: string[]) {
    this.dialogService.open<unknown, SecretDeleteOperation>(SecretDeleteDialogComponent, {
      data: {
        secretIds: secretIds,
        hardDelete: true,
        organizationId: this.organizationId,
      },
    });
  }

  openRestoreSecret(secretIds: string[]) {
    this.dialogService.open<unknown, SecretRestoreOperation>(SecretRestoreDialogComponent, {
      data: {
        secretIds: secretIds,
        organizationId: this.organizationId,
      },
    });
  }
}

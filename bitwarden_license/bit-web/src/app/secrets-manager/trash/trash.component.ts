import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { SecretListView } from "../models/view/secret-list.view";
import {
  SecretDeleteDialogComponent,
  SecretDeleteOperation,
} from "../secrets/dialog/secret-delete.component";

import { TrashService } from "./services/trash.service";

@Component({
  selector: "sm-trash",
  templateUrl: "./trash.component.html",
})
export class TrashComponent implements OnInit {
  secrets$: Observable<SecretListView[]>;

  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private trashService: TrashService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.secrets$ = this.trashService.secret$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        this.organizationId = params.organizationId;
        return await this.getSecrets();
      })
    );
  }

  private async getSecrets(): Promise<SecretListView[]> {
    return await this.trashService.getSecrets(this.organizationId);
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
}

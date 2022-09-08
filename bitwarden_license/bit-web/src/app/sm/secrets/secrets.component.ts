import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, startWith, switchMap } from "rxjs";

import { SecretListView } from "@bitwarden/common/models/view/secretListView";
import { DialogService } from "@bitwarden/components";

import { OperationType, SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretService } from "./secret.service";

@Component({
  selector: "sm-secrets",
  templateUrl: "./secrets.component.html",
})
export class SecretsComponent implements OnInit {
  secrets: SecretListView[];

  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private secretService: SecretService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.secretService.secret$
      .pipe(
        startWith(null),
        combineLatestWith(this.route.params),
        switchMap(async ([_, params]) => {
          this.organizationId = params.organizationId;
          return await this.getSecrets();
        })
      )
      .subscribe((secrets: SecretListView[]) => (this.secrets = secrets));
  }

  private async getSecrets(): Promise<SecretListView[]> {
    return await this.secretService.getSecrets(this.organizationId);
  }

  openEditSecret(secretId: string) {
    this.dialogService.open(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        secretId: secretId,
      },
    });
  }
}

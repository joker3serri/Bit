import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { switchMap } from "rxjs";

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
    this.route.params
      .pipe(
        switchMap(async (params: any) => {
          this.organizationId = params.organizationId;
          await this.getSecrets();
        })
      )
      .subscribe();
    this.secretService.secret$.pipe(switchMap(async (_) => await this.getSecrets())).subscribe();
  }

  private async getSecrets() {
    this.secrets = await this.secretService.getSecrets(this.organizationId);
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

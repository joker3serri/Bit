import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { DialogService } from "@bitwarden/components";

import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";
import { SecretApiService } from "./secret-api.service";
import { SecretService } from "./secret.service";

@Component({
  selector: "sm-secrets",
  templateUrl: "./secrets.component.html",
})
export class SecretsComponent implements OnInit {
  private organizationId: string;

  secrets: SecretIdentifierResponse[];

  constructor(
    private route: ActivatedRoute,
    private secretsApiService: SecretApiService,
    private secretService: SecretService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      this.organizationId = params.organizationId;
      await this.getSecrets();
    });
  }

  openEditSecret(secretId: string) {
    this.dialogService.open(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: "edit",
        secretId: secretId,
      },
    });
  }

  private async getSecrets() {
    const secretIdentifiers: SecretIdentifierResponse[] = (
      await this.secretsApiService.getSecretsByOrganizationId(this.organizationId)
    ).data;
    this.secrets = await this.secretService.decryptSecretIdentifiers(
      this.organizationId,
      secretIdentifiers
    );
  }
}

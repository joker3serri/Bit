import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

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
  secrets: SecretIdentifierResponse[];

  private organizationId: string;
  private destroy$: Subject<void> = new Subject<void>();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openEditSecret(secretId: string) {
    const dialogRef = this.dialogService.open(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: "edit",
        secretId: secretId,
      },
    });
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe(async (result) => {
      if (result === "edit-success") {
        // TODO add toast notification for edit secret success
        await this.getSecrets();
      } else {
        // TODO add toast notification for edit secret failure
      }
    });
  }

  async onCreateSecret(event: string) {
    if (event === "create-success") {
      // TODO add toast notification for create secret success
      await this.getSecrets();
    } else {
      // TODO add toast notification for create secret failure
    }
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

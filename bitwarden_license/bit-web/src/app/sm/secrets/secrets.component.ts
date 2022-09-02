import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { SecretListView } from "@bitwarden/common/models/view/secretListView";
import { DialogService } from "@bitwarden/components";

import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretService } from "./secret.service";

@Component({
  selector: "sm-secrets",
  templateUrl: "./secrets.component.html",
})
export class SecretsComponent implements OnInit {
  secrets: SecretListView[];

  private organizationId: string;
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private secretService: SecretService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async (params: any) => {
      this.organizationId = params.organizationId;
    });

    this.secretService.secret$.pipe(takeUntil(this.destroy$)).subscribe(async (_) => {
      await this.getSecrets();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async getSecrets() {
    this.secrets = await this.secretService.getSecrets(this.organizationId);
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
}

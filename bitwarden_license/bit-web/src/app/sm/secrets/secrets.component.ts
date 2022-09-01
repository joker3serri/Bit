import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { SecretDialogComponent } from "./dialog/secret-dialog.component";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";
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
    private secretService: SecretService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      this.organizationId = params.organizationId;
      await this.secretService.init(this.organizationId);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { DialogService } from "@bitwarden/components";

import { SecretListView } from "../../models/view/secret-list.view";
import {
  SecretDeleteDialogComponent,
  SecretDeleteOperation,
} from "../../secrets/dialog/secret-delete.component";
import {
  OperationType,
  SecretDialogComponent,
  SecretOperation,
} from "../../secrets/dialog/secret-dialog.component";
import { SecretService } from "../../secrets/secret.service";

@Component({
  selector: "sm-project-secrets",
  templateUrl: "./project-secrets.component.html",
})
export class ProjectSecretsComponent {
  secrets$: Observable<SecretListView[]>;

  private organizationId: string;
  private projectId: string;

  constructor(
    private route: ActivatedRoute,
    private secretService: SecretService,
    private dialogService: DialogService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.secrets$ = this.secretService.secret$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        this.organizationId = params.organizationId;
        this.projectId = params.projectId;
        return await this.getSecretsByProject();
      })
    );
  }

  private async getSecretsByProject(): Promise<SecretListView[]> {
    return await this.secretService.getSecretsByProject(this.organizationId, this.projectId);
  }

  openEditSecret(secretId: string) {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        secretId: secretId,
      },
    });
  }

  openDeleteSecret(event: SecretListView[]) {
    this.dialogService.open<unknown, SecretDeleteOperation>(SecretDeleteDialogComponent, {
      data: {
        secrets: event,
      },
    });
  }

  openNewSecretDialog() {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
        projectId: this.projectId,
      },
    });
  }

  copySecretName(name: string) {
    this.platformUtilsService.copyToClipboard(name);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("name"))
    );
  }

  copySecretValue(id: string) {
    const value = this.secretService.getBySecretId(id).then((secret) => secret.value);
    this.copyToClipboardAsync(value).then(() => {
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("valueCopied", this.i18nService.t("value"))
      );
    });
  }

  copyToClipboardAsync(text: Promise<string>) {
    if (this.platformUtilsService.isSafari()) {
      return navigator.clipboard.write([
        new ClipboardItem({
          ["text/plain"]: text,
        }),
      ]);
    }

    return text.then((t) => this.platformUtilsService.copyToClipboard(t));
  }
}

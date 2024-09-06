import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { concatMap, firstValueFrom, map, timeout } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { UserId } from "@bitwarden/common/types/guid";
import {
  CardComponent,
  NoItemsModule,
  SectionComponent,
  SectionHeaderComponent,
  ToastService,
} from "@bitwarden/components";
import {
  GeneratedCredential,
  GeneratedPasswordHistory,
  GeneratorHistoryService,
} from "@bitwarden/generator-history";

import { NoCredentialsIcon } from "./icons/no-credentials.icon";

@Component({
  standalone: true,
  selector: "tools-credential-generator-history",
  templateUrl: "credential-generator-history.component.html",
  imports: [
    CommonModule,
    NoItemsModule,
    JslibModule,
    RouterLink,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
  ],
})
export class CredentialGeneratorHistoryComponent implements OnInit {
  noCredentialssIcon = NoCredentialsIcon;
  protected userId: UserId;
  protected credentials: GeneratedPasswordHistory[] = [];

  constructor(
    private accountService: AccountService,
    private readonly platformUtilsService: PlatformUtilsService,
    private readonly toastService: ToastService,
    private readonly i18nService: I18nService,
    private history: GeneratorHistoryService,
  ) {}

  async ngOnInit() {
    const history = this.accountService.activeAccount$.pipe(
      concatMap((account) => {
        this.userId = account.id;
        return this.history.credentials$(account.id);
      }),
      timeout({
        // timeout after 1 second
        each: 1000,
        with() {
          return [];
        },
      }),
      map((history) => history.map(this.toGeneratedPasswordHistory)),
    );
    return (this.credentials = await firstValueFrom(history));
  }

  toGeneratedPasswordHistory(value: GeneratedCredential) {
    return new GeneratedPasswordHistory(value.credential, value.generationDate.valueOf());
  }

  async copy(credential: string) {
    if (credential == null) {
      return;
    }

    this.platformUtilsService.copyToClipboard(credential, { window: window });
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("valueCopied", this.i18nService.t("password")),
    });
  }
}

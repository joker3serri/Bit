import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { concatMap, firstValueFrom, map, timeout } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserId } from "@bitwarden/common/types/guid";
import { ButtonModule, ContainerComponent } from "@bitwarden/components";
import {
  CredentialGeneratorHistoryComponent as CredentialGeneratorHistoryToolsComponent,
  CredentialGeneratorHistoryEmptyListComponent,
} from "@bitwarden/generator-components";
import {
  GeneratedCredential,
  GeneratedPasswordHistory,
  GeneratorHistoryService,
} from "@bitwarden/generator-history";

import { PopOutComponent } from "../../../platform/popup/components/pop-out.component";
import { PopupFooterComponent } from "../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../platform/popup/layout/popup-page.component";

@Component({
  selector: "bit-credential-generator-history",
  templateUrl: "credential-generator-history.component.html",
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    ContainerComponent,
    JslibModule,
    PopOutComponent,
    PopupHeaderComponent,
    PopupPageComponent,
    CredentialGeneratorHistoryToolsComponent,
    CredentialGeneratorHistoryEmptyListComponent,
    PopupFooterComponent,
  ],
})
export class CredentialGeneratorHistoryComponent implements OnInit {
  protected userId: UserId;
  protected credentials: GeneratedPasswordHistory[] = [];

  constructor(
    private accountService: AccountService,
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
    this.credentials = await firstValueFrom(history);
  }

  clear = async () => {
    await this.history.clear(this.userId);
  };

  toGeneratedPasswordHistory(value: GeneratedCredential) {
    return new GeneratedPasswordHistory(value.credential, value.generationDate.valueOf());
  }
}

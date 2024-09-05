import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import { UserId } from "@bitwarden/common/types/guid";
import { ButtonModule, ContainerComponent } from "@bitwarden/components";
import { PasswordGeneratorHistoryComponent } from "@bitwarden/generator-components";
import { GeneratedCredential, LocalGeneratorHistoryService } from "@bitwarden/generator-history";

import { PopOutComponent } from "../../../platform/popup/components/pop-out.component";
import { PopupFooterComponent } from "../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../platform/popup/layout/popup-page.component";

@Component({
  selector: "bit-password-generator-history-v2",
  templateUrl: "password-generator-history-v2.component.html",
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    ContainerComponent,
    JslibModule,
    PopOutComponent,
    PopupHeaderComponent,
    PopupPageComponent,
    PasswordGeneratorHistoryComponent,
    PopupFooterComponent,
  ],
})
export class PasswordGeneratorHistoryV2Component implements OnInit {
  protected history: LocalGeneratorHistoryService;
  protected userId: UserId;
  protected credentials: GeneratedCredential[] = [];

  constructor(
    encryptService: EncryptService,
    cryptoService: CryptoService,
    stateProvider: StateProvider,
  ) {
    this.history = new LocalGeneratorHistoryService(encryptService, cryptoService, stateProvider);
    stateProvider.activeUserId$.pipe(takeUntilDestroyed()).subscribe((userId) => {
      this.userId = userId;
    });
  }

  ngOnInit() {
    this.history
      .credentials$(this.userId)
      .pipe(takeUntilDestroyed())
      .subscribe((credentials) => {
        this.credentials = credentials;
      });
  }

  async clearHistory() {
    await this.history.clear(this.userId);
  }
}

import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { combineLatest } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { ButtonModule, NoItemsModule } from "@bitwarden/components";
import {
  NoSendsIcon,
  NewSendDropdownComponent,
  SendListItemsContainerComponent,
  SendItemsService,
  SendSearchComponent,
  SendListFiltersComponent,
} from "@bitwarden/send-ui";

import { CurrentAccountComponent } from "../../../auth/popup/account-switching/current-account.component";
import { PopOutComponent } from "../../../platform/popup/components/pop-out.component";
import { PopupHeaderComponent } from "../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../platform/popup/layout/popup-page.component";

enum SendState {
  Empty,
  NoResults,
}

@Component({
  templateUrl: "send-v2.component.html",
  standalone: true,
  imports: [
    PopupPageComponent,
    PopupHeaderComponent,
    PopOutComponent,
    CurrentAccountComponent,
    NoItemsModule,
    JslibModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    NewSendDropdownComponent,
    SendListItemsContainerComponent,
    SendListFiltersComponent,
    SendSearchComponent,
  ],
})
export class SendV2Component implements OnInit, OnDestroy {
  sendType = SendType;

  sendState = SendState;

  protected listState: SendState | null = null;

  protected filteredSends = this.sendItemsService.filteredSends$;

  protected noItemIcon = NoSendsIcon;

  constructor(
    protected sendItemsService: SendItemsService,
    private cdr: ChangeDetectorRef,
  ) {
    combineLatest([this.sendItemsService.emptyList$, this.sendItemsService.noFilteredResults$])
      .pipe(takeUntilDestroyed())
      .subscribe(([emptyList, noFilteredResults]) => {
        if (emptyList) {
          this.listState = SendState.Empty;
          return;
        }

        if (noFilteredResults) {
          this.listState = SendState.NoResults;
          return;
        }
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}

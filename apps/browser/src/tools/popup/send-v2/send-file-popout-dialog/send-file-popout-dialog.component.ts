import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule, DialogModule, DialogService, TypographyModule } from "@bitwarden/components";

import BrowserPopupUtils from "../../../../platform/popup/browser-popup-utils";
import { FilePopoutUtilsService } from "../../services/file-popout-utils.service";

@Component({
  selector: "send-file-popout-dialog",
  templateUrl: "./send-file-popout-dialog.component.html",
  standalone: true,
  imports: [JslibModule, CommonModule, DialogModule, ButtonModule, TypographyModule],
})
export class SendFilePopoutDialogComponent implements OnInit {
  constructor(
    private dialogService: DialogService,
    private filePopoutUtilsService: FilePopoutUtilsService,
  ) {}

  async popOutWindow() {
    await BrowserPopupUtils.openCurrentPagePopout(window);
  }

  close() {
    this.dialogService.closeAll();
  }

  ngOnInit() {
    if (this.filePopoutUtilsService.showFilePopoutMessage(window)) {
      this.dialogService.open(SendFilePopoutDialogComponent);
    }
  }
}

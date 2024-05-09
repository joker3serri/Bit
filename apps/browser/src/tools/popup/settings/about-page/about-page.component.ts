import { Component } from "@angular/core";

import { DialogService } from "@bitwarden/components";

import { BrowserApi } from "../../../../platform/browser/browser-api";
import { AboutDialogComponent } from "../about-dialog/about-dialog.component";

@Component({
  selector: "app-about-page",
  templateUrl: "about-page.component.html",
})
export class AboutPageComponent {
  constructor(private dialogService: DialogService) {}

  about() {
    this.dialogService.open(AboutDialogComponent);
  }

  launchHelp() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab("https://bitwarden.com/help/");
  }
  launchContactForm() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab("https://bitwarden.com/contact/");
  }

  launchForums() {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    BrowserApi.createNewTab("https://bitwarden.com/getinvolved/");
  }
}

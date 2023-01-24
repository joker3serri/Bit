import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { DialogService } from "@bitwarden/components";

import { ServiceAccountView } from "../../models/view/service-account.view";

import {
  AccessTokenOperation,
  AccessTokenCreateDialogComponent,
} from "./dialogs/access-token-create-dialog.component";

@Component({
  selector: "sm-access-token-button",
  templateUrl: "./access-token-button.component.html",
})
export class AccessTokenButtonComponent {
  constructor(private route: ActivatedRoute, private dialogService: DialogService) {}

  async openNewAccessTokenDialog() {
    // TODO once service account names are implemented in service account contents page pass in here.
    const { serviceAccountId, organizationId } = this.route.snapshot.params;
    const serviceAccountView = new ServiceAccountView();
    serviceAccountView.id = serviceAccountId;
    serviceAccountView.name = "placeholder";

    this.dialogService.open<unknown, AccessTokenOperation>(AccessTokenCreateDialogComponent, {
      data: {
        organizationId: organizationId,
        serviceAccountView: serviceAccountView,
      },
    });
  }
}

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { DialogService } from "@bitwarden/components";

import { SecretDialogComponent } from "../secrets/dialog/secret-dialog.component";

@Component({
  selector: "sm-new-menu",
  templateUrl: "./new-menu.component.html",
})
export class NewMenuComponent implements OnInit {
  private organizationId: string;

  constructor(private route: ActivatedRoute, public dialogService: DialogService) {}

  ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      this.organizationId = params.organizationId;
    });
  }

  openSecretDialog() {
    this.dialogService.open(SecretDialogComponent, {
      data: {
        operation: "add",
        data: "gecko",
        organizationId: this.organizationId,
      },
    });
  }
}

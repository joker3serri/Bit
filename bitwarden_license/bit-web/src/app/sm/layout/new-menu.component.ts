import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { SecretDialogComponent } from "../secrets/dialog/secret-dialog.component";

@Component({
  selector: "sm-new-menu",
  templateUrl: "./new-menu.component.html",
})
export class NewMenuComponent implements OnInit {
  private organizationId: string;
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute, private dialogService: DialogService) {}

  ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      this.organizationId = params.organizationId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSecretDialog() {
    this.dialogService.open(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: "add",
      },
    });
  }
}

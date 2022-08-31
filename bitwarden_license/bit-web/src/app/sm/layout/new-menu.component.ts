import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { SecretDialogComponent } from "../secrets/dialog/secret-dialog.component";

@Component({
  selector: "sm-new-menu",
  templateUrl: "./new-menu.component.html",
})
export class NewMenuComponent implements OnInit {
  @Output() createSecretEvent = new EventEmitter<string>();

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
    const dialogRef = this.dialogService.open(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: "add",
      },
    });
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      this.createSecretEvent.emit(result.toString());
    });
  }
}

import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, filter, startWith, switchMap, tap } from "rxjs";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";

import { AccessTokenCreateDialogComponent } from "./access/dialogs/access-token-create-dialog.component";
import { ServiceAccountService } from "./service-account.service";

@Component({
  selector: "sm-service-account",
  templateUrl: "./service-account.component.html",
})
export class ServiceAccountComponent {
  private organizationId: string;
  private serviceAccountId: string;

  private onChange$ = this.serviceAccountService.serviceAccount$.pipe(
    filter((sa) => sa?.id === this.serviceAccountId),
    startWith(null)
  );

  /**
   * TODO: remove when a server method is available that fetches a service account by ID
   */
  protected serviceAccount$ = combineLatest([this.route.params, this.onChange$]).pipe(
    switchMap(async ([params]) => {
      this.serviceAccountId = params.serviceAccountId;
      this.organizationId = params.organizationId;

      return this.serviceAccountService
        .getServiceAccounts(params.organizationId)
        .then((saList) => saList.find((sa) => sa.id === params.serviceAccountId));
    }),
    tap((sa) => {
      if (!sa) {
        this.router.navigate(["/sm", this.organizationId, "service-accounts"]);
      }
    })
  );

  constructor(
    private route: ActivatedRoute,
    private serviceAccountService: ServiceAccountService,
    private dialogService: DialogServiceAbstraction,
    private router: Router
  ) {}

  protected openNewAccessTokenDialog() {
    AccessTokenCreateDialogComponent.openNewAccessTokenDialog(
      this.dialogService,
      this.serviceAccountId,
      this.organizationId
    );
  }
}

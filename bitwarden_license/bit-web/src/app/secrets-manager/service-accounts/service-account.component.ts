import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, catchError, combineLatest, filter, startWith, switchMap, tap } from "rxjs";

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
    tap(([params]) => {
      this.serviceAccountId = params.serviceAccountId;
      this.organizationId = params.organizationId;
    }),
    switchMap(([params]) =>
      this.serviceAccountService.getByServiceAccountId(
        params.serviceAccountId,
        params.organizationId
      )
    ),
    catchError(() => {
      this.router.navigate(["/sm", this.organizationId, "service-accounts"]);
      return EMPTY;
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

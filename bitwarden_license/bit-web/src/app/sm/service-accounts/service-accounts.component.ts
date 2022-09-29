import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { ServiceAccountView } from "@bitwarden/common/models/view/service-account-view";

import { ServiceAccountService } from "./service-account.service";

@Component({
  selector: "sm-service-accounts",
  templateUrl: "./service-accounts.component.html",
})
export class ServiceAccountsComponent implements OnInit, OnDestroy {
  serviceAccounts: ServiceAccountView[];

  private organizationId: string;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private serviceAccountService: ServiceAccountService
  ) {}

  ngOnInit() {
    this.serviceAccountService.serviceAccount$
      .pipe(
        startWith(null),
        combineLatestWith(this.route.params),
        switchMap(async ([_, params]) => {
          this.organizationId = params.organizationId;
          return await this.getServiceAccounts();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (serviceAccounts: ServiceAccountView[]) => (this.serviceAccounts = serviceAccounts)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async getServiceAccounts(): Promise<ServiceAccountView[]> {
    return await this.serviceAccountService.getServiceAccounts(this.organizationId);
  }
}

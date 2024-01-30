import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-secrets-manager-trial",
  templateUrl: "secrets-manager-trial.component.html",
})
export class SecretsManagerTrialComponent implements OnInit, OnDestroy {
  organizationQueryParameter: string;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((queryParameters) => {
      this.organizationQueryParameter = queryParameters.org;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get freeOrganization() {
    return this.organizationQueryParameter === "free";
  }
}

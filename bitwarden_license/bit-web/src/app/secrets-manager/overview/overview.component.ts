import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, switchMap, Subject, takeUntil, combineLatest, startWith } from "rxjs";

import { DialogService } from "@bitwarden/components";

import {
  ProjectDialogComponent,
  ProjectOperation,
} from "../projects/dialog/project-dialog.component";
import { ProjectService } from "../projects/project.service";
import {
  OperationType,
  SecretDialogComponent,
  SecretOperation,
} from "../secrets/dialog/secret-dialog.component";
import { SecretService } from "../secrets/secret.service";
import {
  ServiceAccountDialogComponent,
  ServiceAccountOperation,
} from "../service-accounts/dialog/service-account-dialog.component";
import { ServiceAccountService } from "../service-accounts/service-account.service";

@Component({
  selector: "sm-overview",
  templateUrl: "./overview.component.html",
})
export class OverviewComponent implements OnInit, OnDestroy {
  private organizationId: string;
  private destroy$: Subject<void> = new Subject<void>();

  protected completed$: Observable<{
    importSecrets: boolean;
    createSecret: boolean;
    createProject: boolean;
    createServiceAccount: boolean;
  }> = combineLatest([
    this.route.params,
    this.projectService.project$.pipe(startWith(null)),
    this.secretService.secret$.pipe(startWith(null)),
    this.serviceAccountService.serviceAccount$.pipe(startWith(null)),
  ]).pipe(
    switchMap(([{ organizationId }]) =>
      Promise.all([
        this.projectService.getProjects(organizationId),
        this.secretService.getSecrets(organizationId),
        this.serviceAccountService.getServiceAccounts(organizationId),
      ])
    ),
    map(([projects, secrets, serviceAccounts]) => {
      return {
        importSecrets: secrets.length > 0,
        createSecret: secrets.length > 0,
        createProject: projects.length > 0,
        createServiceAccount: serviceAccounts.length > 0,
      };
    })
  );

  protected onboardingIncomplete$ = this.completed$.pipe(
    map((completed) => Object.values(completed).includes(false))
  );

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private secretService: SecretService,
    private serviceAccountService: ServiceAccountService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.organizationId = params.organizationId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSecretDialog() {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
      },
    });
  }

  openProjectDialog() {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
      },
    });
  }

  openServiceAccountDialog() {
    this.dialogService.open<unknown, ServiceAccountOperation>(ServiceAccountDialogComponent, {
      data: {
        organizationId: this.organizationId,
      },
    });
  }
}

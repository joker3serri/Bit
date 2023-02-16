import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, switchMap, Subject, takeUntil, combineLatest, startWith } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { DialogService } from "@bitwarden/components";

import { ProjectListView } from "../models/view/project-list.view";
import { SecretListView } from "../models/view/secret-list.view";
import {
  ProjectDeleteDialogComponent,
  ProjectDeleteOperation,
} from "../projects/dialog/project-delete-dialog.component";
import {
  ProjectDialogComponent,
  ProjectOperation,
} from "../projects/dialog/project-dialog.component";
import { ProjectService } from "../projects/project.service";
import {
  SecretDeleteDialogComponent,
  SecretDeleteOperation,
} from "../secrets/dialog/secret-delete.component";
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

type Tasks = {
  importSecrets: boolean;
  createSecret: boolean;
  createProject: boolean;
  createServiceAccount: boolean;
};

@Component({
  selector: "sm-overview",
  templateUrl: "./overview.component.html",
})
export class OverviewComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  /**
   * Number of items to show in tables
   */
  private tableSize = 10;
  private organizationId: string;
  protected organizationName: string;

  protected view$: Observable<{
    allProjects: ProjectListView[];
    allSecrets: SecretListView[];
    latestProjects: ProjectListView[];
    latestSecrets: SecretListView[];
    tasks: Tasks;
  }>;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private secretService: SecretService,
    private serviceAccountService: ServiceAccountService,
    private dialogService: DialogService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        map((params) => this.organizationService.get(params.organizationId)),
        takeUntil(this.destroy$)
      )
      .subscribe((org) => {
        this.organizationId = org.id;
        this.organizationName = org.name;
      });

    this.view$ = combineLatest([
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
          latestProjects: this.getRecentItems(projects, this.tableSize),
          latestSecrets: this.getRecentItems(secrets, this.tableSize),
          allProjects: projects,
          allSecrets: secrets,
          tasks: {
            importSecrets: secrets.length > 0,
            createSecret: secrets.length > 0,
            createProject: projects.length > 0,
            createServiceAccount: serviceAccounts.length > 0,
          },
        };
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getRecentItems<T extends { revisionDate: string }[]>(items: T, length: number): T {
    return items
      .sort((a, b) => {
        return new Date(b.revisionDate).getTime() - new Date(a.revisionDate).getTime();
      })
      .slice(0, length) as T;
  }

  // Projects ---

  openEditProject(projectId: string) {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        projectId: projectId,
      },
    });
  }

  openNewProjectDialog() {
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

  openDeleteProjectDialog(event: ProjectListView[]) {
    this.dialogService.open<unknown, ProjectDeleteOperation>(ProjectDeleteDialogComponent, {
      data: {
        projects: event,
      },
    });
  }

  // Secrets ---

  openSecretDialog() {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
      },
    });
  }

  openEditSecret(secretId: string) {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        secretId: secretId,
      },
    });
  }

  openDeleteSecret(secretIds: string[]) {
    this.dialogService.open<unknown, SecretDeleteOperation>(SecretDeleteDialogComponent, {
      data: {
        secretIds: secretIds,
      },
    });
  }

  openNewSecretDialog() {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
      },
    });
  }
}

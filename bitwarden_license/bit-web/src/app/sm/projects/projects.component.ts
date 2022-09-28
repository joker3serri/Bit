import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { ProjectListView } from "@bitwarden/common/models/view/projectListView";
import { DialogService } from "@bitwarden/components";

import {
  OperationType,
  ProjectDialogComponent,
  ProjectOperation,
} from "./dialog/project-dialog.component";
import { ProjectService } from "./project.service";

@Component({
  selector: "sm-projects",
  templateUrl: "./projects.component.html",
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: ProjectListView[];

  private organizationId: string;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.projectService.project$
      .pipe(
        startWith(null),
        combineLatestWith(this.route.params),
        switchMap(async ([_, params]) => {
          this.organizationId = params.organizationId;
          return await this.getProjects();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((projects: ProjectListView[]) => (this.projects = projects));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async getProjects(): Promise<ProjectListView[]> {
    return await this.projectService.getProjects(this.organizationId);
  }

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
}

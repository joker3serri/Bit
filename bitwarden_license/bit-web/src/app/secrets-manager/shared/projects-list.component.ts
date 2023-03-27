import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { TableDataSource } from "@bitwarden/components";

import { ProjectListView } from "../models/view/project-list.view";

@Component({
  selector: "sm-projects-list",
  templateUrl: "./projects-list.component.html",
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  protected dataSource = new TableDataSource<ProjectListView>();
  protected hasWriteAccessOnSelected = false;

  @Input()
  get projects(): ProjectListView[] {
    return this._projects;
  }
  set projects(projects: ProjectListView[]) {
    this.selection.clear();
    this._projects = projects;
    this.dataSource.data = projects;
  }
  private _projects: ProjectListView[];

  @Input()
  set search(search: string) {
    this.dataSource.filter = search;
  }

  @Output() editProjectEvent = new EventEmitter<string>();
  @Output() deleteProjectEvent = new EventEmitter<ProjectListView[]>();
  @Output() newProjectEvent = new EventEmitter();

  private destroy$: Subject<void> = new Subject<void>();

  selection = new SelectionModel<string>(true, []);

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService
  ) {}

  ngOnInit(): void {
    this.selection.changed.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      this.hasWriteAccessOnSelected = this.selectedHasWriteAccess();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.projects.length;
    return numSelected === numRows;
  }

  toggleAll() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.projects.map((s) => s.id));
  }

  deleteProject(projectId: string) {
    this.deleteProjectEvent.emit(this.projects.filter((p) => p.id == projectId));
  }

  bulkDeleteProjects() {
    if (this.selection.selected.length >= 1) {
      this.deleteProjectEvent.emit(
        this.projects.filter((project) => this.selection.isSelected(project.id))
      );
    } else {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nothingSelected")
      );
    }
  }

  private selectedHasWriteAccess() {
    const selectedProjects = this.projects.filter((project) =>
      this.selection.isSelected(project.id)
    );
    if (
      selectedProjects.length == selectedProjects.filter((project) => project.write).length &&
      selectedProjects.length != 0
    ) {
      return true;
    }
    return false;
  }
}

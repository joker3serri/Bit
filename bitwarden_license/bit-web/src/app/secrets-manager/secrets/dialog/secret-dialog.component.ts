import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { lastValueFrom, Subject, takeUntil } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { DialogService } from "@bitwarden/components";

import { ProjectListView } from "../../models/view/project-list.view";
import { ProjectView } from "../../models/view/project.view";
import { SecretListView } from "../../models/view/secret-list.view";
import { SecretProjectView } from "../../models/view/secret-project.view";
import { SecretView } from "../../models/view/secret.view";
import { ProjectService } from "../../projects/project.service";
import { SecretService } from "../secret.service";

import { SecretDeleteDialogComponent, SecretDeleteOperation } from "./secret-delete.component";

export enum OperationType {
  Add,
  Edit,
}

export interface SecretOperation {
  organizationId: string;
  operation: OperationType;
  projectId?: string;
  secretId?: string;
}

@Component({
  selector: "sm-secret-dialog",
  templateUrl: "./secret-dialog.component.html",
})
export class SecretDialogComponent implements OnInit {
  protected formGroup = new FormGroup({
    name: new FormControl("", [Validators.required]),
    value: new FormControl("", [Validators.required]),
    notes: new FormControl(""),
    project: new FormControl("", [Validators.required]),
    newProjectName: new FormControl(""),
  });

  private loading = true;
  projects: ProjectListView[];
  addNewProject = false;
  private newProjectGuid = Utils.newGuid();

  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) private data: SecretOperation,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private projectService: ProjectService,
    private dialogService: DialogService,
    private encryptService: EncryptService,
    private cryptoService: CryptoService
  ) {}

  async ngOnInit() {
    if (this.data.operation === OperationType.Edit && this.data.secretId) {
      await this.loadData();
    } else if (this.data.operation !== OperationType.Add) {
      this.dialogRef.close();
      throw new Error(`The secret dialog was not called with the appropriate operation values.`);
    }

    if (this.data.projectId) {
      this.formGroup.get("project").setValue(this.data.projectId);
    }

    this.projects = await this.projectService
      .getProjects(this.data.organizationId)
      .then((projects) => projects.sort((a, b) => a.name.localeCompare(b.name)));

    if (this.data.projectId == null || this.data.projectId == "") {
      this.addNewProjectOptionToProjectsDropDown();
    }
  }

  async loadData() {
    this.formGroup.disable();
    const secret: SecretView = await this.secretService.getBySecretId(this.data.secretId);
    this.formGroup.setValue({
      name: secret.name,
      value: secret.value,
      notes: secret.note,
      project: secret.projects[0]?.id ?? "",
      newProjectName: "",
    });

    this.loading = false;

    if (secret.write) {
      this.formGroup.enable();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNewProjectOptionToProjectsDropDown() {
    this.formGroup
      .get("project")
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val: string) => {
        this.dropDownSelected(val);
      });

    const addNewProject = new ProjectListView();
    addNewProject.name = this.i18nService.t("addNewProject");
    addNewProject.id = this.newProjectGuid;
    this.projects.unshift(addNewProject);
  }

  dropDownSelected(val: string) {
    this.addNewProject = val == this.newProjectGuid;

    if (this.addNewProject) {
      this.formGroup.get("newProjectName").addValidators([Validators.required]);
    } else {
      this.formGroup.get("newProjectName").clearValidators();
    }

    this.formGroup.updateValueAndValidity();
  }

  get title() {
    return this.data.operation === OperationType.Add ? "newSecret" : "editSecret";
  }

  get showSpinner() {
    return this.data.operation === OperationType.Edit && this.loading;
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    const secretView = this.getSecretView();

    if (this.addNewProject) {
      secretView.projects = await this.addNewProjectGetSecretProjectView();
    }

    if (this.data.operation === OperationType.Add) {
      await this.createSecret(secretView);
    } else {
      secretView.id = this.data.secretId;
      await this.updateSecret(secretView);
    }
    this.dialogRef.close();
  };

  get deleteButtonIsVisible(): boolean {
    return this.data.operation === OperationType.Edit;
  }

  private async addNewProjectGetSecretProjectView() {
    const newProjectView = this.getNewProjectView();
    const createdProject = await this.createProject(newProjectView);

    const orgKey = await this.getOrganizationKey(createdProject.organizationId);

    const projectsMappedToSecretView = new SecretProjectView();
    projectsMappedToSecretView.id = createdProject.id;
    projectsMappedToSecretView.name = await this.encryptService.decryptToUtf8(
      new EncString(createdProject.name),
      orgKey
    );

    const newSecretProjectView: SecretProjectView[] = [];
    newSecretProjectView.push(projectsMappedToSecretView);
    return newSecretProjectView;
  }

  private async createProject(projectView: ProjectView) {
    return await this.projectService.create(this.data.organizationId, projectView);
  }

  private async getOrganizationKey(organizationId: string): Promise<SymmetricCryptoKey> {
    return await this.cryptoService.getOrgKey(organizationId);
  }

  protected openDeleteSecretDialog() {
    const secretListView: SecretListView[] = this.getSecretListView();

    const dialogRef = this.dialogService.open<unknown, SecretDeleteOperation>(
      SecretDeleteDialogComponent,
      {
        data: {
          secrets: secretListView,
        },
      }
    );

    // If the secret is deleted, chain close this dialog after the delete dialog
    lastValueFrom(dialogRef.closed).then(
      (closeData) => closeData !== undefined && this.dialogRef.close()
    );
  }

  private async createSecret(secretView: SecretView) {
    await this.secretService.create(this.data.organizationId, secretView);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("secretCreated"));
  }

  private getNewProjectView() {
    const projectView = new ProjectView();
    projectView.organizationId = this.data.organizationId;
    projectView.name = this.formGroup.value.newProjectName;
    return projectView;
  }

  private async updateSecret(secretView: SecretView) {
    await this.secretService.update(this.data.organizationId, secretView);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("secretEdited"));
  }

  private getSecretView() {
    const secretView = new SecretView();
    secretView.organizationId = this.data.organizationId;
    secretView.name = this.formGroup.value.name;
    secretView.value = this.formGroup.value.value;
    secretView.note = this.formGroup.value.notes;
    secretView.projects = [this.projects.find((p) => p.id == this.formGroup.value.project)];
    return secretView;
  }

  private getSecretListView() {
    const secretListViews: SecretListView[] = [];
    const emptyProjects: SecretProjectView[] = [];

    const secretListView = new SecretListView();

    if (this.formGroup.value.project) {
      secretListView.projects = [this.projects.find((p) => p.id == this.formGroup.value.project)];
    } else {
      secretListView.projects = emptyProjects;
    }

    secretListView.organizationId = this.data.organizationId;
    secretListView.id = this.data.secretId;
    secretListView.name = this.formGroup.value.name;
    secretListViews.push(secretListView);
    return secretListViews;
  }
}

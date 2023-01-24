import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  GroupProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";

import { AccessPolicyService } from "./access-policy.service";

@Component({
  selector: "sm-access-selector",
  templateUrl: "./access-selector.component.html",
})
export class AccessSelectorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() projectAccessPolicies: ProjectAccessPoliciesView;
  @Input() label: string;
  @Input() hint: string;

  private readonly userIcon = "bwi-user";
  private readonly groupIcon = "bwi-family";
  loading = true;
  organizationId: string;
  projectId: string;
  potentialGrantees: SelectItemView[];
  private destroy$: Subject<void> = new Subject<void>();

  formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required]),
  });

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  async ngOnInit(): Promise<void> {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });
    await this.setMultiSelect();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      !changes.projectAccessPolicies.firstChange &&
      this.getAccessPoliciesCount(changes.projectAccessPolicies.currentValue) <
        this.getAccessPoliciesCount(changes.projectAccessPolicies.previousValue)
    ) {
      await this.setMultiSelect();
    }
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    this.loading = true;
    this.formGroup.disable();

    const projectAccessPoliciesView = new ProjectAccessPoliciesView();
    projectAccessPoliciesView.userAccessPolicies = this.formGroup.value.multiSelect
      ?.filter((selection) => selection.icon === this.userIcon)
      ?.map((filtered) => {
        const view = new UserProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.organizationUserId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    projectAccessPoliciesView.groupAccessPolicies = this.formGroup.value.multiSelect
      ?.filter((selection) => selection.icon === this.groupIcon)
      ?.map((filtered) => {
        const view = new GroupProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.groupId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    const result = await this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      projectAccessPoliciesView
    );
    this.clearCreatedItems(result);
    this.loading = false;
    this.formGroup.enable();
    this.formGroup.reset();
  };

  private clearCreatedItems(projectAccessPoliciesView: ProjectAccessPoliciesView) {
    if (projectAccessPoliciesView.groupAccessPolicies?.length > 0) {
      this.potentialGrantees = this.potentialGrantees.filter(
        (item) => !projectAccessPoliciesView.groupAccessPolicies.some((ap) => ap.groupId == item.id)
      );
    }
    if (projectAccessPoliciesView.userAccessPolicies?.length > 0) {
      this.potentialGrantees = this.potentialGrantees.filter(
        (item) =>
          !projectAccessPoliciesView.userAccessPolicies.some(
            (ap) => ap.organizationUserId == item.id
          )
      );
    }
  }

  private getAccessPoliciesCount(projectAccessPoliciesView: ProjectAccessPoliciesView) {
    return (
      projectAccessPoliciesView.groupAccessPolicies.length +
      projectAccessPoliciesView.userAccessPolicies.length
    );
  }

  private async setMultiSelect(): Promise<void> {
    this.loading = true;
    this.formGroup.disable();

    const potentialGrantees = await this.getPeopleDetails(this.projectId);
    this.potentialGrantees = potentialGrantees
      .filter(
        (potentialGrantee) =>
          !this.projectAccessPolicies.userAccessPolicies.some(
            (ap) => ap.organizationUserId == potentialGrantee.id
          )
      )
      .filter(
        (potentialGrantee) =>
          !this.projectAccessPolicies.groupAccessPolicies.some(
            (ap) => ap.groupId == potentialGrantee.id
          )
      );

    this.loading = false;
    this.formGroup.enable();
    this.formGroup.reset();
  }

  private async getPeopleDetails(projectId: string): Promise<SelectItemView[]> {
    const potentialGrantees = await this.accessPolicyService.getPeoplePotentialGrantees(projectId);
    return potentialGrantees.map((potentialGrantee) => {
      let icon: string;
      let listName: string;
      if (potentialGrantee.type == "user") {
        icon = this.userIcon;
        listName = potentialGrantee.name + ` (${potentialGrantee.email})`;
      } else {
        icon = this.groupIcon;
        listName = potentialGrantee.name;
      }
      return {
        icon: icon,
        id: potentialGrantee.id,
        labelName: potentialGrantee.name,
        listName: listName,
      };
    });
  }
}

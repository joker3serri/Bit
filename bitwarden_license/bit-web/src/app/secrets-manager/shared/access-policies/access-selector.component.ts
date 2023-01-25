import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  GroupProjectAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";
import { ServiceAccountService } from "../../service-accounts/service-account.service";

import { AccessPolicyService } from "./access-policy.service";

@Component({
  selector: "sm-access-selector",
  templateUrl: "./access-selector.component.html",
})
export class AccessSelectorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() accessType: "projectPeople" | "projectServiceAccounts";
  @Input() projectAccessPolicies: ProjectAccessPoliciesView;
  @Input() label: string;
  @Input() hint: string;

  private readonly userIcon = "bwi-user";
  private readonly groupIcon = "bwi-family";
  private readonly serviceAccountIcon = "bwi-wrench";

  potentialGrantees: SelectItemView[];
  projectId: string;
  organizationId: string;
  loading = true;
  private destroy$: Subject<void> = new Subject<void>();

  formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required]),
  });

  constructor(
    private route: ActivatedRoute,
    private serviceAccountService: ServiceAccountService,
    private accessPolicyService: AccessPolicyService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });
    await this.setMultiSelect();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    this.loading = true;
    this.formGroup.disable();

    const projectAccessPoliciesView = this.createProjectAccessPoliciesViewFromSelected();
    const createdAccessPolicies = await this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      projectAccessPoliciesView
    );

    this.clearFromPotentialGrantees(createdAccessPolicies);

    this.loading = false;
    this.formGroup.enable();
    this.formGroup.reset();
  };

  private async setMultiSelect(): Promise<void> {
    this.loading = true;
    this.formGroup.disable();

    let potentialGrantees;
    if (this.accessType == "projectPeople") {
      potentialGrantees = await this.getPeoplePotentialGrantees(this.projectId);
    } else {
      potentialGrantees = await this.getServiceAccountPotentialGrantees(this.organizationId);
    }

    this.potentialGrantees = this.filterExistingAccessPolicies(potentialGrantees);

    this.loading = false;
    this.formGroup.enable();
    this.formGroup.reset();
  }

  private clearFromPotentialGrantees(createdAccessPolicies: ProjectAccessPoliciesView) {
    if (createdAccessPolicies.groupAccessPolicies?.length > 0) {
      this.potentialGrantees = this.potentialGrantees.filter(
        (item) => !createdAccessPolicies.groupAccessPolicies.some((ap) => ap.groupId == item.id)
      );
    }
    if (createdAccessPolicies.userAccessPolicies?.length > 0) {
      this.potentialGrantees = this.potentialGrantees.filter(
        (item) =>
          !createdAccessPolicies.userAccessPolicies.some((ap) => ap.organizationUserId == item.id)
      );
    }
    if (createdAccessPolicies.serviceAccountAccessPolicies?.length > 0) {
      this.potentialGrantees = this.potentialGrantees.filter(
        (item) =>
          !createdAccessPolicies.serviceAccountAccessPolicies.some(
            (ap) => ap.serviceAccountId == item.id
          )
      );
    }
  }

  private createProjectAccessPoliciesViewFromSelected(): ProjectAccessPoliciesView {
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

    projectAccessPoliciesView.serviceAccountAccessPolicies = this.formGroup.value.multiSelect
      ?.filter((selection) => selection.icon === this.serviceAccountIcon)
      ?.map((filtered) => {
        const view = new ServiceAccountProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.serviceAccountId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });
    return projectAccessPoliciesView;
  }

  private getAccessPoliciesCount(projectAccessPoliciesView: ProjectAccessPoliciesView) {
    return (
      projectAccessPoliciesView.groupAccessPolicies.length +
      projectAccessPoliciesView.serviceAccountAccessPolicies.length +
      projectAccessPoliciesView.userAccessPolicies.length
    );
  }

  private async getPeoplePotentialGrantees(projectId: string): Promise<SelectItemView[]> {
    const peoplePotentialGrantees = await this.accessPolicyService.getPeoplePotentialGrantees(
      projectId
    );
    return peoplePotentialGrantees.map((potentialGrantee) => {
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

  private async getServiceAccountPotentialGrantees(
    organizationId: string
  ): Promise<SelectItemView[]> {
    const serviceAccounts = await this.serviceAccountService.getServiceAccounts(organizationId);
    return serviceAccounts.map((serviceAccount) => {
      const selectItemView: SelectItemView = {
        icon: this.serviceAccountIcon,
        id: serviceAccount.id,
        labelName: serviceAccount.name,
        listName: serviceAccount.name,
      };
      return selectItemView;
    });
  }

  private filterExistingAccessPolicies(potentialGrantees: SelectItemView[]): SelectItemView[] {
    return potentialGrantees
      .filter(
        (potentialGrantee) =>
          !this.projectAccessPolicies.serviceAccountAccessPolicies.some(
            (ap) => ap.serviceAccountId == potentialGrantee.id
          )
      )
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
  }
}

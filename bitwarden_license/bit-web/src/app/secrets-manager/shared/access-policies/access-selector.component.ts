import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
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
  @Input() projectAccessPolicies: ProjectAccessPoliciesView;
  @Input() label: string;
  @Input() hint: string;
  @Input() selectorType: "projectPeople" | "projectServiceAccounts";

  private readonly userIcon = "bwi-user";
  private readonly groupIcon = "bwi-family";
  private readonly serviceAccountIcon = "bwi-wrench";

  formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required]),
  });
  loading = true;
  organizationId: string;
  projectId: string;
  baseItems: SelectItemView[];
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private serviceAccountService: ServiceAccountService,
    private organizationUserService: OrganizationUserService,
    private accessPolicyService: AccessPolicyService,
    private apiService: ApiService
  ) {}

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
    if (!changes.projectAccessPolicies.firstChange) {
      await this.setMultiSelect();
    }
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

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

    await this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      projectAccessPoliciesView
    );
    this.formGroup.reset();
  };

  private async setMultiSelect(): Promise<void> {
    if (this.selectorType === "projectPeople") {
      let orgUsers = await this.getUserDetails(this.organizationId);
      orgUsers = orgUsers.filter(
        (orgUser) =>
          !this.projectAccessPolicies.userAccessPolicies.some(
            (ap) => ap.organizationUserId == orgUser.id
          )
      );
      let orgGroups = await this.getGroupDetails(this.organizationId);
      orgGroups = orgGroups.filter(
        (orgGroup) =>
          !this.projectAccessPolicies.groupAccessPolicies.some((ap) => ap.groupId == orgGroup.id)
      );
      this.baseItems = [...orgUsers, ...orgGroups];
    } else {
      const orgServiceAccounts = await this.getServiceAccountDetails(this.organizationId);
      this.baseItems = orgServiceAccounts.filter(
        (orgServiceAccount) =>
          !this.projectAccessPolicies.serviceAccountAccessPolicies.some(
            (ap) => ap.serviceAccountId == orgServiceAccount.id
          )
      );
    }
    this.loading = false;
  }

  private async getUserDetails(organizationId: string): Promise<SelectItemView[]> {
    const users = await this.organizationUserService.getAllUsers(organizationId);
    return users.data.map((user) => {
      const selectItemView: SelectItemView = {
        icon: this.userIcon,
        id: user.id,
        labelName: user.name,
        listName: user.name + ` (${user.email})`,
      };
      return selectItemView;
    });
  }

  private async getGroupDetails(organizationId: string): Promise<SelectItemView[]> {
    const groups = await this.apiService.getGroups(organizationId);
    return groups.data.map((group) => {
      const selectItemView: SelectItemView = {
        icon: this.groupIcon,
        id: group.id,
        labelName: group.name,
        listName: group.name,
      };
      return selectItemView;
    });
  }

  private async getServiceAccountDetails(organizationId: string): Promise<SelectItemView[]> {
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
}

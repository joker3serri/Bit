import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import { ServiceAccountService } from "../../service-accounts/service-account.service";

import { AccessPolicyService } from "./access-policy.service";

@Component({
  selector: "sm-access-selector",
  templateUrl: "./access-selector.component.html",
})
export class AccessSelectorComponent implements OnInit, OnDestroy {
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
    await this.setMultiSelect(this.organizationId);
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

    const userIds = this.formGroup.value.multiSelect
      ?.filter((obj) => obj.icon === this.userIcon)
      ?.map((filteredObj) => filteredObj.id);
    const groupIds = this.formGroup.value.multiSelect
      ?.filter((obj) => obj.icon === this.groupIcon)
      ?.map((filteredObj) => filteredObj.id);
    const serviceAccountIds = this.formGroup.value.multiSelect
      ?.filter((obj) => obj.icon === this.serviceAccountIcon)
      ?.map((filteredObj) => filteredObj.id);

    await this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      userIds,
      groupIds,
      serviceAccountIds
    );
    this.formGroup.reset();
  };

  private async setMultiSelect(organizationId: string): Promise<void> {
    if (this.selectorType === "projectPeople") {
      const orgUsers = await this.getUserDetails(organizationId);
      const orgGroups = await this.getGroupDetails(organizationId);
      this.baseItems = [...orgUsers, ...orgGroups];
    } else {
      this.baseItems = await this.getServiceAccountDetails(organizationId);
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

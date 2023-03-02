import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, share, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { DialogService, SelectItemView } from "@bitwarden/components";

import {
  GroupProjectAccessPolicyView,
  ProjectAccessPoliciesView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import {
  AccessSelectorComponent,
  AccessSelectorRowView,
} from "../../shared/access-policies/access-selector.component";
import {
  AccessRemovalDetails,
  AccessRemovalDialogComponent,
} from "../../shared/access-policies/dialogs/access-removal-dialog.component";

@Component({
  selector: "sm-project-people",
  templateUrl: "./project-people.component.html",
})
export class ProjectPeopleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private organizationId: string;
  private projectId: string;
  private rows: AccessSelectorRowView[];

  protected rows$: Observable<AccessSelectorRowView[]> =
    this.accessPolicyService.projectAccessPolicyChanges$.pipe(
      startWith(null),
      switchMap(() =>
        this.accessPolicyService.getProjectAccessPolicies(this.organizationId, this.projectId)
      ),
      map((policies) => {
        const rows: AccessSelectorRowView[] = [];
        policies.userAccessPolicies.forEach((policy) => {
          rows.push({
            type: "user",
            name: policy.organizationUserName,
            id: policy.organizationUserId,
            accessPolicyId: policy.id,
            read: policy.read,
            write: policy.write,
            userId: policy.userId,
            icon: AccessSelectorComponent.userIcon,
          });
        });

        policies.groupAccessPolicies.forEach((policy) => {
          rows.push({
            type: "group",
            name: policy.groupName,
            id: policy.groupId,
            accessPolicyId: policy.id,
            read: policy.read,
            write: policy.write,
            currentUserInGroup: policy.currentUserInGroup,
            icon: AccessSelectorComponent.groupIcon,
          });
        });
        return rows;
      }),
      share()
    );

  protected handleCreateAccessPolicies(selected: SelectItemView[]) {
    const projectAccessPoliciesView = new ProjectAccessPoliciesView();
    projectAccessPoliciesView.userAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "user")
      .map((filtered) => {
        const view = new UserProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.organizationUserId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    projectAccessPoliciesView.groupAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "group")
      .map((filtered) => {
        const view = new GroupProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.groupId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    return this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      projectAccessPoliciesView
    );
  }

  protected async handleDeleteAccessPolicy(policy: AccessSelectorRowView) {
    const organization = this.organizationService.get(this.organizationId);
    if (
      !(organization.isOwner || organization.isAdmin) &&
      (await this.needToShowWarning(policy, organization.userId))
    ) {
      this.launchDeleteWarningDialog(policy);
      return;
    }

    try {
      await this.accessPolicyService.deleteAccessPolicy(policy.accessPolicyId);
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  protected async handleUpdateAccessPolicy(policy: AccessSelectorRowView) {
    const organization = this.organizationService.get(this.organizationId);

    if (
      !(organization.isOwner || organization.isAdmin) &&
      policy.read === true &&
      policy.write === false &&
      (await this.needToShowWarning(policy, organization.userId))
    ) {
      this.launchUpdateWarningDialog(policy);
      return;
    }

    try {
      return await this.accessPolicyService.updateAccessPolicy(
        AccessSelectorComponent.getBaseAccessPolicyView(policy)
      );
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private dialogService: DialogService,
    private validationService: ValidationService,
    private accessPolicyService: AccessPolicyService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });

    this.rows$.pipe(takeUntil(this.destroy$)).subscribe((rows) => {
      this.rows = rows;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async needToShowWarning(
    policy: AccessSelectorRowView,
    currentUserId: string
  ): Promise<boolean> {
    const readWriteGroupPolicies = this.rows
      .filter((x) => x.accessPolicyId != policy.accessPolicyId)
      .filter((x) => x.currentUserInGroup && x.read && x.write).length;
    const readWriteUserPolicies = this.rows
      .filter((x) => x.accessPolicyId != policy.accessPolicyId)
      .filter((x) => x.userId == currentUserId && x.read && x.write).length;

    if (policy.type === "user" && policy.userId == currentUserId && readWriteGroupPolicies == 0) {
      return true;
    } else if (
      policy.type === "group" &&
      policy.currentUserInGroup &&
      readWriteUserPolicies == 0 &&
      readWriteGroupPolicies == 0
    ) {
      return true;
    }
    return false;
  }

  private async launchDeleteWarningDialog(policy: AccessSelectorRowView) {
    this.dialogService.open<unknown, AccessRemovalDetails>(AccessRemovalDialogComponent, {
      data: {
        title: "smAccessRemovalWarningProjectTitle",
        message: "smAccessRemovalWarningProjectMessage",
        operation: "delete",
        type: "project",
        returnRoute: ["sm", this.organizationId, "projects"],
        policy,
      },
    });
  }

  private launchUpdateWarningDialog(policy: AccessSelectorRowView) {
    this.dialogService.open<unknown, AccessRemovalDetails>(AccessRemovalDialogComponent, {
      data: {
        title: "smAccessRemovalWarningProjectTitle",
        message: "smAccessRemovalWarningProjectMessage",
        operation: "update",
        type: "project",
        returnRoute: ["sm", this.organizationId, "projects"],
        policy,
      },
    });
  }
}

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
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
      })
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

    if (organization.isOwner || organization.isAdmin) {
      return await this.accessPolicyService.deleteAccessPolicy(policy.accessPolicyId);
    }

    if (await this.needToShowWarning(policy, organization.userId)) {
      this.launchDeleteWarningDialog(policy.accessPolicyId);
      return;
    }

    return await this.accessPolicyService.deleteAccessPolicy(policy.accessPolicyId);
  }

  protected async handleUpdateAccessPolicy(policy: AccessSelectorRowView) {
    const organization = this.organizationService.get(this.organizationId);

    if (organization.isOwner || organization.isAdmin) {
      return await this.accessPolicyService.updateAccessPolicy(
        AccessSelectorComponent.getBaseAccessPolicyView(policy)
      );
    }

    if (
      policy.read === true &&
      policy.write === false &&
      (await this.needToShowWarning(policy, organization.userId))
    ) {
      this.launchUpdateWarningDialog(policy);
      return;
    }

    return await this.accessPolicyService.updateAccessPolicy(
      AccessSelectorComponent.getBaseAccessPolicyView(policy)
    );
  }

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private dialogService: DialogService,
    private router: Router,
    private accessPolicyService: AccessPolicyService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async needToShowWarning(policy: AccessSelectorRowView, userId: string): Promise<boolean> {
    if (policy.type === "user" && policy.userId == userId) {
      return true;
    } else if (policy.type === "group" && policy.currentUserInGroup) {
      return true;
    }
    return false;
  }

  private launchDeleteWarningDialog(accessPolicyId: string) {
    const dialogRef = this.dialogService.open<unknown, AccessRemovalDetails>(
      AccessRemovalDialogComponent,
      {
        data: {
          title: "smAccessRemovalWarningProjectTitle",
          message: "smAccessRemovalWarningProjectMessage",
        },
      }
    );
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result === "confirmed") {
        this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
        this.router.navigate(["sm", this.organizationId, "projects"]);
      } else {
        this.accessPolicyService.refreshProjectAccessPolicyChanges();
      }
    });
  }

  private launchUpdateWarningDialog(policy: AccessSelectorRowView) {
    const dialogRef = this.dialogService.open<unknown, AccessRemovalDetails>(
      AccessRemovalDialogComponent,
      {
        data: {
          title: "smAccessRemovalWarningProjectTitle",
          message: "smAccessRemovalWarningProjectMessage",
        },
      }
    );
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result === "confirmed") {
        this.accessPolicyService.updateAccessPolicy(
          AccessSelectorComponent.getBaseAccessPolicyView(policy)
        );
        this.router.navigate(["sm", this.organizationId, "projects"]);
      } else {
        this.accessPolicyService.refreshProjectAccessPolicyChanges();
      }
    });
  }
}

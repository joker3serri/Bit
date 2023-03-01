import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatestWith, map, Observable, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { DialogService } from "@bitwarden/components";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  GroupServiceAccountAccessPolicyView,
  ServiceAccountAccessPoliciesView,
  UserServiceAccountAccessPolicyView,
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
  selector: "sm-service-account-people",
  templateUrl: "./service-account-people.component.html",
})
export class ServiceAccountPeopleComponent {
  private destroy$ = new Subject<void>();
  private serviceAccountId: string;
  private organizationId: string;

  protected rows$: Observable<AccessSelectorRowView[]> =
    this.accessPolicyService.serviceAccountAccessPolicyChanges$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(([_, params]) =>
        this.accessPolicyService.getServiceAccountAccessPolicies(params.serviceAccountId)
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
            icon: AccessSelectorComponent.userIcon,
            static: true,
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
            icon: AccessSelectorComponent.groupIcon,
            static: true,
          });
        });

        return rows;
      })
    );

  protected handleCreateAccessPolicies(selected: SelectItemView[]) {
    const serviceAccountAccessPoliciesView = new ServiceAccountAccessPoliciesView();
    serviceAccountAccessPoliciesView.userAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "user")
      .map((filtered) => {
        const view = new UserServiceAccountAccessPolicyView();
        view.grantedServiceAccountId = this.serviceAccountId;
        view.organizationUserId = filtered.id;
        view.read = true;
        view.write = true;
        return view;
      });

    serviceAccountAccessPoliciesView.groupAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "group")
      .map((filtered) => {
        const view = new GroupServiceAccountAccessPolicyView();
        view.grantedServiceAccountId = this.serviceAccountId;
        view.groupId = filtered.id;
        view.read = true;
        view.write = true;
        return view;
      });

    return this.accessPolicyService.createServiceAccountAccessPolicies(
      this.serviceAccountId,
      serviceAccountAccessPoliciesView
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
    private organizationUserService: OrganizationUserService,
    private organizationService: OrganizationService,
    private dialogService: DialogService,
    private router: Router,
    private accessPolicyService: AccessPolicyService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.serviceAccountId = params.serviceAccountId;
      this.organizationId = params.organizationId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async needToShowWarning(policy: AccessSelectorRowView, userId: string): Promise<boolean> {
    // FIXME this doesn't work if the user doesn't have ManageUsers permission
    const orgUsers = await this.organizationUserService.getAllUsers(this.organizationId);
    const currentOrgUser = orgUsers.data.find((x) => x.userId == userId);

    if (policy.type === "user" && currentOrgUser.id == policy.id) {
      return true;
    } else if (policy.type === "group") {
      const groups = await this.organizationUserService.getOrganizationUserGroups(
        this.organizationId,
        currentOrgUser.id
      );
      if (groups.includes(policy.id)) {
        return true;
      }
    }
    return false;
  }

  private launchDeleteWarningDialog(accessPolicyId: string) {
    const dialogRef = this.dialogService.open<unknown, AccessRemovalDetails>(
      AccessRemovalDialogComponent,
      {
        data: {
          title: "smAccessRemovalWarningSaTitle",
          message: "smAccessRemovalWarningSaMessage",
        },
      }
    );
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result === "confirmed") {
        this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
        this.router.navigate(["sm", this.organizationId, "service-accounts"]);
      } else {
        this.accessPolicyService.refreshServiceAccountAccessPolicyChanges();
      }
    });
  }

  private launchUpdateWarningDialog(policy: AccessSelectorRowView) {
    const dialogRef = this.dialogService.open<unknown, AccessRemovalDetails>(
      AccessRemovalDialogComponent,
      {
        data: {
          title: "smAccessRemovalWarningSaTitle",
          message: "smAccessRemovalWarningSaMessage",
        },
      }
    );
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result === "confirmed") {
        this.accessPolicyService.updateAccessPolicy(
          AccessSelectorComponent.getBaseAccessPolicyView(policy)
        );
        this.router.navigate(["sm", this.organizationId, "service-accounts"]);
      } else {
        this.accessPolicyService.refreshServiceAccountAccessPolicyChanges();
      }
    });
  }
}

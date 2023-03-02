import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  combineLatestWith,
  map,
  Observable,
  share,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
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
  private rows: AccessSelectorRowView[];

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
            userId: policy.userId,
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
            currentUserInGroup: policy.currentUserInGroup,
            icon: AccessSelectorComponent.groupIcon,
            static: true,
          });
        });

        return rows;
      }),
      share()
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

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private dialogService: DialogService,
    private validationService: ValidationService,
    private accessPolicyService: AccessPolicyService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.serviceAccountId = params.serviceAccountId;
      this.organizationId = params.organizationId;
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

  private launchDeleteWarningDialog(policy: AccessSelectorRowView) {
    this.dialogService.open<unknown, AccessRemovalDetails>(AccessRemovalDialogComponent, {
      data: {
        title: "smAccessRemovalWarningSaTitle",
        message: "smAccessRemovalWarningSaMessage",
        operation: "delete",
        type: "service-account",
        returnRoute: ["sm", this.organizationId, "service-accounts"],
        policy,
      },
    });
  }
}

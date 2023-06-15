import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, map, Observable, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import { ServiceAccountProjectAccessPolicyView } from "../../models/view/access-policy.view";
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
  selector: "sm-service-account-projects",
  templateUrl: "./service-account-projects.component.html",
})
export class ServiceAccountProjectsComponent {
  private destroy$ = new Subject<void>();
  private serviceAccountId: string;
  private organizationId: string;
  private rows: AccessSelectorRowView[];

  protected rows$: Observable<AccessSelectorRowView[]> =
    this.accessPolicyService.serviceAccountGrantedPolicyChanges$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(([_, params]) =>
        this.accessPolicyService.getGrantedPolicies(params.serviceAccountId, params.organizationId)
      ),
      map((policies) => {
        return policies.map((policy) => {
          return {
            type: "project",
            name: policy.grantedProjectName,
            id: policy.grantedProjectId,
            accessPolicyId: policy.id,
            read: policy.read,
            write: policy.write,
            icon: AccessSelectorComponent.projectIcon,
            static: false,
          } as AccessSelectorRowView;
        });
      })
    );

  protected handleCreateAccessPolicies(selected: SelectItemView[]) {
    const serviceAccountProjectAccessPolicyView = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "project")
      .map((filtered) => {
        const view = new ServiceAccountProjectAccessPolicyView();
        view.serviceAccountId = this.serviceAccountId;
        view.grantedProjectId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    return this.accessPolicyService.createGrantedPolicies(
      this.organizationId,
      this.serviceAccountId,
      serviceAccountProjectAccessPolicyView
    );
  }

  protected async handleUpdateAccessPolicy(policy: AccessSelectorRowView) {
    if (
      policy.read === true &&
      policy.write === false &&
      (await this.accessPolicyService.needToShowAccessRemovalWarning(
        this.organizationId,
        policy,
        this.rows
      ))
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

  protected async handleDeleteAccessPolicy(policy: AccessSelectorRowView) {
    try {
      await this.accessPolicyService.deleteAccessPolicy(policy.accessPolicyId);
    } catch (e) {
      this.validationService.showError(e);
    }
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
  constructor(
    private route: ActivatedRoute,
    private validationService: ValidationService,
    private accessPolicyService: AccessPolicyService,
    private dialogService: DialogServiceAbstraction
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.serviceAccountId = params.serviceAccountId;
    });

    this.rows$.pipe(takeUntil(this.destroy$)).subscribe((rows) => {
      this.rows = rows;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

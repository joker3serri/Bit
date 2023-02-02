import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import {
  combineLatestWith,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs";

import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  GroupProjectAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { PotentialGranteeView } from "../../models/view/potential-grantee.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";

import { AccessPolicyService } from "./access-policy.service";

@Component({
  selector: "sm-access-selector",
  templateUrl: "./access-selector.component.html",
})
export class AccessSelectorComponent implements OnInit, OnDestroy {
  @Input() label: string;
  @Input() hint: string;

  private readonly userIcon = "bwi-user";
  private readonly groupIcon = "bwi-family";
  private readonly serviceAccountIcon = "bwi-wrench";

  @Input() projectAccessPolicies$: Observable<ProjectAccessPoliciesView>;
  @Input() potentialGrantees$: Observable<PotentialGranteeView[]>;

  private projectId: string;
  private organizationId: string;
  private destroy$: Subject<void> = new Subject<void>();

  protected loading = true;
  protected formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required]),
  });
  protected selectItemsView$: Observable<SelectItemView[]>;

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  async ngOnInit(): Promise<void> {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });

    this.selectItemsView$ = this.projectAccessPolicies$.pipe(
      distinctUntilChanged(
        (prev, curr) => this.getAccessPoliciesCount(curr) >= this.getAccessPoliciesCount(prev)
      ),
      combineLatestWith(this.potentialGrantees$),
      map(([projectAccessPolicies, potentialGrantees]) =>
        this.createSelectView(projectAccessPolicies, potentialGrantees)
      ),
      tap(() => {
        this.loading = false;
        this.formGroup.enable();
        this.formGroup.reset();
      })
    );
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

    await this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      this.createProjectAccessPoliciesViewFromSelected()
    );

    return firstValueFrom(this.selectItemsView$);
  };

  private createSelectView = (
    projectAccessPolicies: ProjectAccessPoliciesView,
    potentialGrantees: PotentialGranteeView[]
  ): SelectItemView[] => {
    const selectItemsView = potentialGrantees.map((granteeView) => {
      let icon: string;
      let listName: string;
      if (granteeView.type === "user") {
        icon = this.userIcon;
        listName = `${granteeView.name} (${granteeView.email})`;
      } else if (granteeView.type === "group") {
        icon = this.groupIcon;
        listName = granteeView.name;
      } else {
        icon = this.serviceAccountIcon;
        listName = granteeView.name;
      }
      return {
        icon: icon,
        id: granteeView.id,
        labelName: granteeView.name,
        listName: listName,
      };
    });
    return this.filterExistingAccessPolicies(selectItemsView, projectAccessPolicies);
  };

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

  private filterExistingAccessPolicies(
    potentialGrantees: SelectItemView[],
    projectAccessPolicies: ProjectAccessPoliciesView
  ): SelectItemView[] {
    return potentialGrantees
      .filter(
        (potentialGrantee) =>
          !projectAccessPolicies.serviceAccountAccessPolicies.some(
            (ap) => ap.serviceAccountId === potentialGrantee.id
          )
      )
      .filter(
        (potentialGrantee) =>
          !projectAccessPolicies.userAccessPolicies.some(
            (ap) => ap.organizationUserId === potentialGrantee.id
          )
      )
      .filter(
        (potentialGrantee) =>
          !projectAccessPolicies.groupAccessPolicies.some(
            (ap) => ap.groupId === potentialGrantee.id
          )
      );
  }
}

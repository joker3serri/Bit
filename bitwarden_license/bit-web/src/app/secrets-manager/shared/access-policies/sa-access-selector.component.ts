import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import { ServiceAccountProjectAccessPolicyView } from "../../models/view/access-policy.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";
import { ServiceAccountService } from "../../service-accounts/service-account.service";

import { AccessPolicyService } from "./access-policy.service";

@Component({
  selector: "sm-sa-access-selector",
  templateUrl: "./sa-access-selector.component.html",
})
export class SaAccessSelectorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() projectAccessPolicies: ProjectAccessPoliciesView;
  @Input() label: string;
  @Input() hint: string;

  private readonly serviceAccountIcon = "bwi-wrench";

  formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required]),
  });
  loading = true;
  disabled = true;
  organizationId: string;
  projectId: string;
  baseItems: SelectItemView[];
  private destroy$: Subject<void> = new Subject<void>();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes.projectAccessPolicies.firstChange) {
      this.loading = true;
      this.disabled = true;
      this.formGroup.reset();
      await this.setMultiSelect();
      this.formGroup.reset();
    }
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    this.loading = true;
    this.disabled = true;

    const projectAccessPoliciesView = new ProjectAccessPoliciesView();

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
  };

  private async setMultiSelect(): Promise<void> {
    this.loading = true;
    this.disabled = true;
    const orgServiceAccounts = await this.getServiceAccountDetails(this.organizationId);
    this.baseItems = orgServiceAccounts.filter(
      (orgServiceAccount) =>
        !this.projectAccessPolicies.serviceAccountAccessPolicies.some(
          (ap) => ap.serviceAccountId == orgServiceAccount.id
        )
    );
    this.loading = false;
    this.disabled = false;
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

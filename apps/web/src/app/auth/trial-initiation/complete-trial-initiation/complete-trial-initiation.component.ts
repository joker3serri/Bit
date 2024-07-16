import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { PasswordInputResult, RegistrationFinishService } from "@bitwarden/auth/angular";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/admin-console/models/domain/master-password-policy-options";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { OrganizationBillingServiceAbstraction as OrganizationBillingService } from "@bitwarden/common/billing/abstractions/organization-billing.service";
import { ProductTierType, ProductType } from "@bitwarden/common/billing/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { ToastService } from "@bitwarden/components";

import {
  OrganizationCreatedEvent,
  SubscriptionProduct,
  TrialOrganizationType,
} from "../../../billing/accounts/trial-initiation/trial-billing-step.component";
import { RouterService } from "../../../core/router.service";
import { AcceptOrganizationInviteService } from "../../organization-invite/accept-organization.service";
import { VerticalStepperComponent } from "../vertical-stepper/vertical-stepper.component";

@Component({
  selector: "app-complete-trial-initiation",
  templateUrl: "complete-trial-initiation.component.html",
})
export class CompleteTrialInitiationComponent implements OnInit, OnDestroy {
  @ViewChild("stepper", { static: false }) verticalStepper: VerticalStepperComponent;

  /** Password Manager or Secrets Manager */
  product: ProductType;
  /** The tier of product being subscribed to */
  productTier: ProductTierType;
  /** Product types that display steppers for Password Manager */
  stepperProductTypes: ProductTierType[] = [
    ProductTierType.Teams,
    ProductTierType.Enterprise,
    ProductTierType.Families,
  ];

  /** Display multi-step trial flow when true */
  useTrialStepper = false;

  /** True, registering a password is in progress */
  submitting = false;

  /** Valid product types, used to filter out invalid query parameters */
  validProducts = [ProductType.PasswordManager, ProductType.SecretsManager];

  orgInfoSubLabel = "";
  orgId = "";
  orgLabel = "";
  billingSubLabel = "";
  policies: Policy[];
  enforcedPolicyOptions: MasterPasswordPolicyOptions;

  /** User's email address associated with the trial */
  email = "";
  /** Token from the backend associated with the email verification */
  emailVerificationToken: string;

  orgInfoFormGroup = this.formBuilder.group({
    name: ["", { validators: [Validators.required, Validators.maxLength(50)], updateOn: "change" }],
    billingEmail: [""],
  });

  private destroy$ = new Subject<void>();
  protected readonly SubscriptionProduct = SubscriptionProduct;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private formBuilder: FormBuilder,
    private logService: LogService,
    private policyApiService: PolicyApiServiceAbstraction,
    private policyService: PolicyService,
    private i18nService: I18nService,
    private routerService: RouterService,
    protected organizationBillingService: OrganizationBillingService,
    private acceptOrganizationInviteService: AcceptOrganizationInviteService,
    private toastService: ToastService,
    private registrationFinishService: RegistrationFinishService,
    private validationService: ValidationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((qParams) => {
      // Retrieve email from query params
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
        this.orgInfoFormGroup.controls.billingEmail.setValue(qParams.email);
      }

      // Show email validation toast when coming from email
      if (qParams.fromEmail && qParams.fromEmail === "true") {
        this.toastService.showToast({
          title: null,
          message: this.i18nService.t("emailVerifiedV2"),
          variant: "success",
        });
      }

      if (qParams.token != null) {
        this.emailVerificationToken = qParams.token;
      }

      // Get product from query params, default to password manager
      this.product = this.validProducts.includes(qParams.product)
        ? qParams.product
        : ProductType.PasswordManager;

      const productTierParam = parseInt(qParams.productTier) as ProductTierType;

      /** Only show the trial stepper for a subset of types */
      const showPasswordManagerStepper = this.stepperProductTypes.includes(productTierParam);

      /** All types of secret manager should see the trial stepper */
      const showSecretsManagerStepper = this.isSecretsManager();

      if ((showPasswordManagerStepper || showSecretsManagerStepper) && !isNaN(productTierParam)) {
        this.productTier = productTierParam;

        this.orgLabel = this.planTypeDisplay;

        this.useTrialStepper = true;
      }

      // Are they coming from an email for sponsoring a families organization
      // After logging in redirect them to setup the families sponsorship
      this.setupFamilySponsorship(qParams.sponsorshipToken);
    });

    const invite = await this.acceptOrganizationInviteService.getOrganizationInvite();
    if (invite != null) {
      try {
        this.policies = await this.policyApiService.getPoliciesByToken(
          invite.organizationId,
          invite.token,
          invite.email,
          invite.organizationUserId,
        );
      } catch (e) {
        this.logService.error(e);
      }
    }

    if (this.policies != null) {
      this.policyService
        .masterPasswordPolicyOptions$(this.policies)
        .pipe(takeUntil(this.destroy$))
        .subscribe((enforcedPasswordPolicyOptions) => {
          this.enforcedPolicyOptions = enforcedPasswordPolicyOptions;
        });
    }

    this.orgInfoFormGroup.controls.name.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.orgInfoFormGroup.controls.name.markAsTouched();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  stepSelectionChange(event: StepperSelectionEvent) {
    // Set org info sub label
    if (event.selectedIndex === 1 && this.orgInfoFormGroup.controls.name.value === "") {
      this.orgInfoSubLabel = this.planInfoLabel;
    } else if (event.previouslySelectedIndex === 1) {
      this.orgInfoSubLabel = this.orgInfoFormGroup.controls.name.value;
    }

    // Set billing sub label
    if (event.selectedIndex === 2) {
      this.billingSubLabel = this.i18nService.t("billingTrialSubLabel");
    }
  }

  billingSuccess(event: any) {
    this.orgId = event?.orgId;
    this.billingSubLabel = event?.subLabelText;
    this.verticalStepper.next();
  }

  createdOrganization(event: OrganizationCreatedEvent) {
    this.orgId = event.organizationId;
    this.billingSubLabel = event.planDescription;
    this.verticalStepper.next();
  }

  previousStep() {
    this.verticalStepper.previous();
  }

  isSecretsManager() {
    return this.product === ProductType.SecretsManager;
  }

  async getStartedNavigation(): Promise<void> {
    if (this.product === ProductType.SecretsManager) {
      await this.router.navigate(["sm", this.orgId]);
    } else {
      await this.router.navigate(["organizations", this.orgId, "vault"]);
    }
  }

  async inviteUsersNavigation(): Promise<void> {
    await this.router.navigate(["organizations", this.orgId, "members"]);
  }

  async conditionallyCreateOrganization(): Promise<void> {
    if (!this.isSecretsManagerFree) {
      this.verticalStepper.next();
      return;
    }

    const response = await this.organizationBillingService.startFree({
      organization: {
        name: this.orgInfoFormGroup.value.name,
        billingEmail: this.orgInfoFormGroup.value.billingEmail,
      },
      plan: {
        type: 0,
        subscribeToSecretsManager: true,
        isFromSecretsManagerTrial: true,
      },
    });

    this.orgId = response.id;
    this.verticalStepper.next();
  }

  async handlePasswordSubmit(passwordInputResult: PasswordInputResult) {
    this.submitting = true;
    try {
      await this.registrationFinishService.finishRegistration(
        this.email,
        passwordInputResult,
        this.emailVerificationToken,
      );
    } catch (e) {
      this.validationService.showError(e);
      this.submitting = false;
      return;
    }

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("newAccountCreated"),
    });

    this.submitting = false;

    if (this.useTrialStepper) {
      this.verticalStepper.next();
    } else {
      await this.router.navigate(["/login"], { queryParams: { email: this.email } });
    }
  }

  get isSecretsManagerFree() {
    return this.isSecretsManager() && this.productTier === ProductTierType.Free;
  }

  get planTypeDisplay() {
    switch (this.productTier) {
      case ProductTierType.Teams:
        return "Teams";
      case ProductTierType.Enterprise:
        return "Enterprise";
      case ProductTierType.Families:
        return "Families";
      default:
        return "";
    }
  }

  get planInfoLabel() {
    switch (this.productTier) {
      case ProductTierType.Teams:
        return this.i18nService.t("enterTeamsOrgInfo");
      case ProductTierType.Enterprise:
        return this.i18nService.t("enterEnterpriseOrgInfo");
      case ProductTierType.Families:
        return this.i18nService.t("enterFamiliesOrgInfo");
      default:
        return "";
    }
  }

  get trialOrganizationType(): TrialOrganizationType {
    if (this.productTier === ProductTierType.Free) {
      return null;
    }

    return this.productTier;
  }

  private setupFamilySponsorship(sponsorshipToken: string) {
    if (sponsorshipToken != null) {
      const route = this.router.createUrlTree(["setup/families-for-enterprise"], {
        queryParams: { plan: sponsorshipToken },
      });
      this.routerService.setPreviousUrl(route.toString());
    }
  }
}

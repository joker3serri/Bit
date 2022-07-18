import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlanType } from "@bitwarden/common/enums/planType";
import { ProductType } from "@bitwarden/common/enums/productType";

import { VerticalStepperComponent } from "../vertical-stepper/vertical-stepper.component";

@Component({
  selector: "app-trial",
  templateUrl: "trial-initiation.component.html",
})
export class TrialInitiationComponent implements OnInit {
  email = "";
  org = "teams";
  orgInfoSubLabel = "";
  orgId = "";
  billingSubLabel = "";
  plan: PlanType;
  product: ProductType;
  @ViewChild("stepper", { static: true }) verticalStepper: VerticalStepperComponent;

  orgInfoFormGroup = this.formBuilder.group({
    name: ["", [Validators.required]],
    email: [""],
  });

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private titleCasePipe: TitleCasePipe,
    private apiService: ApiService,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(first()).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
      }
      if (qParams.org) {
        this.org = qParams.org;
      }

      if (qParams.org === "families") {
        this.plan = PlanType.FamiliesAnnually;
        this.product = ProductType.Families;
      } else if (qParams.org === "teams") {
        this.plan = PlanType.TeamsAnnually;
        this.product = ProductType.Teams;
      } else if (qParams.org === "enterprise") {
        this.plan = PlanType.EnterpriseAnnually;
        this.product = ProductType.Enterprise;
      }
    });
  }

  stepSelectionChange(event: StepperSelectionEvent) {
    // Set org info sub label
    if (event.selectedIndex === 1 && this.orgInfoFormGroup.controls.name.value === "") {
      this.orgInfoSubLabel =
        "Enter your " + this.titleCasePipe.transform(this.org) + " organization information";
    } else if (event.previouslySelectedIndex === 1) {
      this.orgInfoSubLabel = this.orgInfoFormGroup.controls.name.value;
    }

    //set billing sub label
    if (event.selectedIndex === 2) {
      this.billingSubLabel = this.i18nService.t("billingTrialSubLabel");
    }
  }

  createdAccount(email: string) {
    this.email = email;
    this.orgInfoFormGroup.get("email")?.setValue(email);
    this.verticalStepper.next();
  }

  billingSuccess(event: any) {
    this.orgId = event?.orgId;
    this.billingSubLabel = event?.subLabelText;
    this.verticalStepper.next();
  }

  previousStep() {
    this.verticalStepper.previous();
  }
}

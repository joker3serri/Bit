import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs";

import { VerticalStepperComponent } from "../vertical-stepper/vertical-stepper.component";

@Component({
  selector: "app-trial",
  templateUrl: "trial-initiation.component.html",
})
export class TrialInitiationComponent implements OnInit {
  email = "";
  org = "teams";
  @ViewChild("stepper", { static: true }) verticalStepper: VerticalStepperComponent;

  formGroup = this.formBuilder.group({
    name: ["", [Validators.required]],
    additionalStorage: [0, [Validators.min(0), Validators.max(99)]],
    additionalSeats: [0, [Validators.min(0), Validators.max(100000)]],
    businessName: [""],
    plan: [],
    product: [],
  });

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(first()).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
      }
      if (qParams.org) {
        this.org = qParams.org;
      }
    });
  }

  createdAccount(email: string) {
    this.email = email;
    this.verticalStepper.next();
  }
}

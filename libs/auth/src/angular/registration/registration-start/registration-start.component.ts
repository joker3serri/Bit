import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ButtonModule, CheckboxModule, FormFieldModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "auth-registration-start",
  templateUrl: "./registration-start.component.html",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JslibModule,
    FormFieldModule,
    CheckboxModule,
    ButtonModule,
  ],
})
export class RegistrationStartComponent implements OnInit, OnDestroy {
  queryParamFromOrgInvite: boolean = false;

  showTerms = true;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    name: [""],
    acceptPolicies: [false, [this.acceptPoliciesValidator()]],
  });

  get email(): FormControl {
    return this.formGroup.get("email") as FormControl;
  }

  get name(): FormControl {
    return this.formGroup.get("name") as FormControl;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
  ) {
    this.showTerms = !platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    this.listenForQueryParamChanges();
  }

  submit = async () => {};

  private listenForQueryParamChanges() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email?.setValue(qParams.email);
        this.queryParamFromOrgInvite = qParams.fromOrgInvite === "true";
      }
    });
  }

  private acceptPoliciesValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const ctrlValue = control.value;

      return !ctrlValue && this.showTerms ? { required: true } : null;
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

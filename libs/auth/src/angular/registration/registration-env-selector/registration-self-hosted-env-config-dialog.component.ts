import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Subject } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { FormFieldModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "auth-registration-self-hosted-env-config-dialog",
  templateUrl: "registration-self-hosted-env-config-dialog.component.html",
  imports: [CommonModule, JslibModule, ReactiveFormsModule, FormFieldModule],
})
export class RegistrationSelfHostedEnvConfigDialogComponent implements OnInit, OnDestroy {
  formGroup = this.formBuilder.group({
    // selectedRegion: [null, Validators.required],
  });

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

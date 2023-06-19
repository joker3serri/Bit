import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { ControlsOf } from "@bitwarden/angular/types/controls-of";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { SecretsManagerSubscription } from "./sm-subscribe.component";


@Component({
  selector: "sm-subscribe-standalone",
  templateUrl: "sm-subscribe-standalone.component.html",
})
export class SecretsManagerSubscribeStandaloneComponent {
  @Input() plan: PlanResponse;

  // TODO: extract in a reusable way
  formGroup: FormGroup<ControlsOf<SecretsManagerSubscription>> = this.formBuilder.group({
    enabled: [false],
    userSeats: [1, [Validators.required, Validators.min(0), Validators.max(100000)]],
    additionalServiceAccounts: [
      0,
      [Validators.required, Validators.min(0), Validators.max(100000)],
    ],
  });

  formPromise: Promise<void>;

  constructor(
    private formBuilder: FormBuilder,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private i18nService: I18nService
  ) {}

  submit = async () => {
    // TODO: api call
    // this.formPromise = TODO

    await this.formPromise;

    try {
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("subscriptionUpdated")
      );
    } catch (e) {
      this.logService.error(e);
    }

    // necessary?
    // this.onAdjusted.emit();
  };
}

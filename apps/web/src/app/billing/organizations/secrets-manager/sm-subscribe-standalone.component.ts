import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { secretsManagerSubscribeFormFactory } from "./sm-subscribe.component";

@Component({
  selector: "sm-subscribe-standalone",
  templateUrl: "sm-subscribe-standalone.component.html",
})
export class SecretsManagerSubscribeStandaloneComponent {
  @Input() plan: PlanResponse;
  @Output() onSubscribe = new EventEmitter<void>();

  formGroup = secretsManagerSubscribeFormFactory(this.formBuilder);

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

    this.onSubscribe.emit();
  };
}

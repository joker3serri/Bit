import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, EventEmitter, Inject, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { UpdateTwoFactorDuoRequest } from "@bitwarden/common/auth/models/request/update-two-factor-duo.request";
import { TwoFactorDuoResponse } from "@bitwarden/common/auth/models/response/two-factor-duo.response";
import { AuthResponse } from "@bitwarden/common/auth/types/auth-response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

import { TwoFactorBaseComponent } from "./two-factor-base.component";

@Component({
  selector: "app-two-factor-duo",
  templateUrl: "two-factor-duo.component.html",
})
export class TwoFactorDuoComponent extends TwoFactorBaseComponent {
  @Output() onChangeStatus: EventEmitter<boolean> = new EventEmitter();
  type = TwoFactorProviderType.Duo;
  formGroup = this.formBuilder.group({
    ikey: ["", [Validators.required]],
    skey: ["", [Validators.required]],
    host: ["", [Validators.required]],
  });
  override componentName = "app-two-factor-duo";

  constructor(
    @Inject(DIALOG_DATA) protected data: AuthResponse<TwoFactorDuoResponse>,
    apiService: ApiService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    dialogService: DialogService,
    private formBuilder: FormBuilder,
    private dialogRef: DialogRef,
  ) {
    super(
      apiService,
      i18nService,
      platformUtilsService,
      logService,
      userVerificationService,
      dialogService,
    );
  }

  get ikey() {
    return this.formGroup.get("ikey").value;
  }
  get skey() {
    return this.formGroup.get("skey").value;
  }
  get host() {
    return this.formGroup.get("host").value;
  }
  set ikey(value: string) {
    this.formGroup.get("ikey").setValue(value);
  }
  set skey(value: string) {
    this.formGroup.get("skey").setValue(value);
  }
  set host(value: string) {
    this.formGroup.get("host").setValue(value);
  }

  async ngOnInit() {
    super.auth(this.data);
    this.processResponse(this.data.response);
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    if (this.enabled) {
      await this.disableMethod();
      this.onChangeStatus.emit(this.enabled);
    } else {
      await this.enable();
      this.onChangeStatus.emit(this.enabled);
    }
  };

  protected async enable() {
    const request = await this.buildRequestModel(UpdateTwoFactorDuoRequest);
    request.integrationKey = this.ikey;
    request.secretKey = this.skey;
    request.host = this.host;

    let response: TwoFactorDuoResponse;

    if (this.organizationId != null) {
      response = await this.apiService.putTwoFactorOrganizationDuo(this.organizationId, request);
    } else {
      response = await this.apiService.putTwoFactorDuo(request);
    }

    this.processResponse(response);
    this.onUpdated.emit(true);
  }

  onClose = () => {
    this.dialogRef.close(this.enabled);
  };

  private processResponse(response: TwoFactorDuoResponse) {
    this.ikey = response.integrationKey;
    this.skey = response.secretKey;
    this.host = response.host;
    this.enabled = response.enabled;
  }

  /**
   * Strongly typed helper to open a TwoFactorDuoComponentComponent
   * @param dialogService Instance of the dialog service that will be used to open the dialog
   * @param config Configuration for the dialog
   */
  static open = (
    dialogService: DialogService,
    config: DialogConfig<AuthResponse<TwoFactorDuoResponse>>,
  ) => {
    return dialogService.open<boolean>(TwoFactorDuoComponent, config);
  };
}

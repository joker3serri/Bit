import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  Validators,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { VerificationType } from "@bitwarden/common/auth/enums/verification-type";
import { Verification } from "@bitwarden/common/auth/types/verification";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  AsyncActionsModule,
  FormFieldModule,
  IconButtonModule,
  LinkModule,
} from "@bitwarden/components";

type UserVerificationOptions = {
  server: {
    otp: boolean;
    masterPassword: boolean;
  };
  client: {
    masterPassword: boolean;
    pin: boolean;
    biometrics: boolean;
  };
};

enum ActiveClientVerificationOption {
  MasterPassword = "masterPassword",
  Pin = "pin",
  Biometrics = "biometrics",
  None = "none",
}

/**
 * Used for general-purpose user verification throughout the app.
 * Collects the user's master password, or if they are not using a password, prompts for an OTP via email.
 * This is exposed to the parent component via the ControlValueAccessor interface (e.g. bind it to a FormControl).
 * Use UserVerificationService to verify the user's input.
 */
@Component({
  selector: "app-user-verification-form-input",
  templateUrl: "user-verification-form-input.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UserVerificationFormInputComponent,
    },
  ],
  animations: [
    trigger("sent", [
      transition(":enter", [style({ opacity: 0 }), animate("100ms", style({ opacity: 1 }))]),
    ]),
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JslibModule,
    FormFieldModule,
    AsyncActionsModule,
    IconButtonModule,
    LinkModule,
  ],
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class UserVerificationFormInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() verificationType: "server" | "client";

  // This represents what verification methods are available to the user.
  userVerificationOptions: UserVerificationOptions = {
    server: {
      otp: false,
      masterPassword: false,
    },
    client: {
      masterPassword: false,
      pin: false,
      biometrics: false,
    },
  };

  ActiveClientVerificationOption = ActiveClientVerificationOption;

  private _activeClientVerificationOptionSubject =
    new BehaviorSubject<ActiveClientVerificationOption>(null);

  activeClientVerificationOption$ = this._activeClientVerificationOptionSubject.asObservable();

  set activeClientVerificationOption(value: ActiveClientVerificationOption) {
    this._activeClientVerificationOptionSubject.next(value);
  }

  get activeClientVerificationOption(): ActiveClientVerificationOption {
    return this._activeClientVerificationOptionSubject.getValue();
  }

  get hasMultipleClientVerificationOptions(): boolean {
    let optionsCount = 0;
    if (this.userVerificationOptions.client.masterPassword) {
      optionsCount++;
    }
    if (this.userVerificationOptions.client.pin) {
      optionsCount++;
    }
    if (this.userVerificationOptions.client.biometrics) {
      optionsCount++;
    }
    return optionsCount >= 2;
  }

  private _invalidSecret = false;
  @Input()
  get invalidSecret() {
    return this._invalidSecret;
  }
  set invalidSecret(value: boolean) {
    this._invalidSecret = value;
    this.invalidSecretChange.emit(value);

    // ISSUE: This is pretty hacky but unfortunately there is no way of knowing if the parent
    // control has been marked as touched, see: https://github.com/angular/angular/issues/10887
    // When that functionality has been added we should also look into forwarding reactive form
    // controls errors so that we don't need a separate input/output `invalidSecret`.
    if (value) {
      this.secret.markAsTouched();
    }
    this.secret.updateValueAndValidity({ emitEvent: false });
  }
  @Output() invalidSecretChange = new EventEmitter<boolean>();

  disableRequestOTP = false;
  sentCode = false;

  secret = new FormControl("", [
    Validators.required,
    () => {
      if (this.invalidSecret) {
        return {
          invalidSecret: {
            message: this.userVerificationOptions.client.masterPassword
              ? this.i18nService.t("incorrectPassword")
              : this.i18nService.t("incorrectCode"),
          },
        };
      }
    },
  ]);

  private onChange: (value: Verification) => void;
  private destroy$ = new Subject<void>();

  constructor(
    private userVerificationService: UserVerificationService,
    private i18nService: I18nService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private platformUtilsService: PlatformUtilsService,
  ) {}

  async ngOnInit() {
    await this.determineAvailableVerificationMethods();

    this.processChanges(this.secret.value);

    this.secret.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((secret: string) => this.processChanges(secret));
  }

  private async determineAvailableVerificationMethods(): Promise<void> {
    if (this.verificationType === "client") {
      const [userHasMasterPassword, pinLockType, biometricsEnabled] = await Promise.all([
        this.userVerificationService.hasMasterPasswordAndMasterKeyHash(),
        this.vaultTimeoutSettingsService.isPinLockSet(),
        this.platformUtilsService.supportsBiometric(),
      ]);

      this.userVerificationOptions.client = {
        masterPassword: userHasMasterPassword,
        pin: pinLockType !== "DISABLED",
        biometrics: biometricsEnabled,
      };

      this.setActiveClientVerificationOption();
      this.setupClientVerificationOptionChangeHandler();
    } else {
      // server
      const userHasMasterPassword =
        await this.userVerificationService.hasMasterPasswordAndMasterKeyHash();

      this.userVerificationOptions.server = {
        masterPassword: userHasMasterPassword,
        otp: !userHasMasterPassword,
      };
    }
  }

  private setActiveClientVerificationOption(): void {
    // Priorities should be Bio > Pin > Master Password for speed based on design
    if (this.userVerificationOptions.client.biometrics) {
      this.activeClientVerificationOption = ActiveClientVerificationOption.Biometrics;
    } else if (this.userVerificationOptions.client.pin) {
      this.activeClientVerificationOption = ActiveClientVerificationOption.Pin;
    } else if (this.userVerificationOptions.client.masterPassword) {
      this.activeClientVerificationOption = ActiveClientVerificationOption.MasterPassword;
    } else {
      this.activeClientVerificationOption = ActiveClientVerificationOption.None;
    }
  }

  private setupClientVerificationOptionChangeHandler(): void {
    this.activeClientVerificationOption$
      .pipe(takeUntil(this.destroy$))
      .subscribe((activeClientVerificationOption: ActiveClientVerificationOption) => {
        this.handleActiveClientVerificationOptionChange(activeClientVerificationOption);
      });
  }

  // TODO: consider more direct methods of handling this
  private async handleActiveClientVerificationOptionChange(
    activeClientVerificationOption: ActiveClientVerificationOption,
  ): Promise<void> {
    // clear secret value when switching verification methods
    this.secret.setValue(null);

    // if changing to biometrics, we need to prompt for biometrics
    if (activeClientVerificationOption === "biometrics") {
      await this.userVerificationService.verifyUser({ type: VerificationType.Biometrics });
    }
  }

  requestOTP = async () => {
    if (!this.userVerificationOptions.client.masterPassword) {
      this.disableRequestOTP = true;
      try {
        await this.userVerificationService.requestOTP();
        this.sentCode = true;
      } finally {
        this.disableRequestOTP = false;
      }
    }
  };

  writeValue(obj: any): void {
    this.secret.setValue(obj);
  }

  /** Required for NG_VALUE_ACCESSOR */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** Required for NG_VALUE_ACCESSOR */
  registerOnTouched(fn: any): void {
    // Not implemented
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disableRequestOTP = isDisabled;
    if (isDisabled) {
      this.secret.disable();
    } else {
      this.secret.enable();
    }
  }

  processChanges(secret: string) {
    this.invalidSecret = false;

    if (this.onChange == null) {
      return;
    }

    this.onChange({
      type: this.userVerificationOptions.client.masterPassword
        ? VerificationType.MasterPassword
        : VerificationType.OTP,
      secret: Utils.isNullOrWhitespace(secret) ? null : secret,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

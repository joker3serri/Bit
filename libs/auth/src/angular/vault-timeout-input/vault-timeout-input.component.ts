import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import { filter, map, Observable, Subject, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { VaultTimeoutAction } from "@bitwarden/common/enums/vault-timeout-action.enum";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { VaultTimeout, VaultTimeoutOption } from "@bitwarden/common/types/vault-timeout.type";
import { FormFieldModule, SelectModule } from "@bitwarden/components";

interface VaultTimeoutFormValue {
  vaultTimeout: VaultTimeout | null;
  custom: {
    hours: number | null;
    minutes: number | null;
  };
}

@Component({
  selector: "auth-vault-timeout-input",
  templateUrl: "vault-timeout-input.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, ReactiveFormsModule, FormFieldModule, SelectModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: VaultTimeoutInputComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: VaultTimeoutInputComponent,
    },
  ],
})
export class VaultTimeoutInputComponent
  implements ControlValueAccessor, Validator, OnInit, OnDestroy, OnChanges
{
  protected readonly VaultTimeoutAction = VaultTimeoutAction;

  get showCustom() {
    return this.form.get("vaultTimeout").value === VaultTimeoutInputComponent.CUSTOM_VALUE;
  }

  get exceedsMinimumTimeout(): boolean {
    return true;
    return (
      !this.showCustom || this.customTimeInMinutes() > VaultTimeoutInputComponent.MIN_CUSTOM_MINUTES
    );
  }

  get exceedsMaximumTimeout(): boolean {
    return true;
    return (
      this.showCustom &&
      this.customTimeInMinutes() >
        this.vaultTimeoutPolicyMinutes + 60 * this.vaultTimeoutPolicyHours
    );
  }

  get filteredVaultTimeoutOptions(): VaultTimeoutOption[] {
    // by policy max value
    if (this.vaultTimeoutPolicy == null) {
      return this.vaultTimeoutOptions;
    }

    return this.vaultTimeoutOptions.filter((option) => {
      if (typeof option.value === "number") {
        return option.value <= this.vaultTimeoutPolicy.data.minutes;
      }

      return false;
    });
  }

  static CUSTOM_VALUE = -100;
  static MIN_CUSTOM_MINUTES = 0;

  form = this.formBuilder.group({
    vaultTimeout: [null],
    custom: this.formBuilder.group({
      hours: [null],
      minutes: [null],
    }),
  });

  @Input() vaultTimeoutOptions: VaultTimeoutOption[];

  vaultTimeoutPolicy: Policy;
  vaultTimeoutPolicyHours: number;
  vaultTimeoutPolicyMinutes: number;

  protected canLockVault$: Observable<boolean>;

  private onChange: (vaultTimeout: VaultTimeout) => void;
  private validatorChange: () => void;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private policyService: PolicyService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private i18nService: I18nService,
  ) {}

  async ngOnInit() {
    this.policyService
      .get$(PolicyType.MaximumVaultTimeout)
      .pipe(
        filter((policy) => policy != null),
        takeUntil(this.destroy$),
      )
      .subscribe((policy) => {
        this.vaultTimeoutPolicy = policy;
        this.applyVaultTimeoutPolicy();
      });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: VaultTimeoutFormValue) => {
        if (this.onChange) {
          this.onChange(this.getVaultTimeout(value));
        }
      });

    // Assign the current value to the custom fields
    // so that if the user goes from a numeric value to custom
    // we can initialize the custom fields with the current value
    // ex: user picks 5 min, goes to custom, we want to show 0 hr, 5 min in the custom fields
    this.form.controls.vaultTimeout.valueChanges
      .pipe(
        filter((value) => value !== VaultTimeoutInputComponent.CUSTOM_VALUE),
        takeUntil(this.destroy$),
      )
      .subscribe((value) => {
        const current = Math.max(value, 1);

        // This cannot emit an event b/c it would cause form.valueChanges to fire again
        // and we are already handling that above so just silently update
        // custom fields when vaultTimeout changes to a non-custom value
        this.form.patchValue(
          {
            custom: {
              hours: Math.floor(current / 60),
              minutes: current % 60,
            },
          },
          { emitEvent: false },
        );
      });

    this.canLockVault$ = this.vaultTimeoutSettingsService
      .availableVaultTimeoutActions$()
      .pipe(map((actions) => actions.includes(VaultTimeoutAction.Lock)));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    if (
      !this.vaultTimeoutOptions.find((p) => p.value === VaultTimeoutInputComponent.CUSTOM_VALUE)
    ) {
      this.vaultTimeoutOptions.push({
        name: this.i18nService.t("custom"),
        value: VaultTimeoutInputComponent.CUSTOM_VALUE,
      });
    }
  }

  getVaultTimeout(value: VaultTimeoutFormValue) {
    if (value.vaultTimeout !== VaultTimeoutInputComponent.CUSTOM_VALUE) {
      return value.vaultTimeout;
    }

    return value.custom.hours * 60 + value.custom.minutes;
  }

  writeValue(value: number): void {
    if (value == null) {
      return;
    }

    if (this.vaultTimeoutOptions.every((p) => p.value !== value)) {
      this.form.setValue({
        vaultTimeout: VaultTimeoutInputComponent.CUSTOM_VALUE,
        custom: {
          hours: Math.floor(value / 60),
          minutes: value % 60,
        },
      });
      return;
    }

    this.form.patchValue({
      vaultTimeout: value,
    });
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    // Empty
  }

  setDisabledState?(isDisabled: boolean): void {
    // Empty
  }

  validate(control: AbstractControl): ValidationErrors {
    if (this.vaultTimeoutPolicy && this.vaultTimeoutPolicy?.data?.minutes < control.value) {
      return { policyError: true };
    }

    if (!this.exceedsMinimumTimeout) {
      return { minTimeoutError: true };
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorChange = fn;
  }

  private customTimeInMinutes() {
    return this.form.value.custom.hours * 60 + this.form.value.custom.minutes;
  }

  private applyVaultTimeoutPolicy() {
    this.vaultTimeoutPolicyHours = Math.floor(this.vaultTimeoutPolicy.data.minutes / 60);
    this.vaultTimeoutPolicyMinutes = this.vaultTimeoutPolicy.data.minutes % 60;

    this.vaultTimeoutOptions = this.vaultTimeoutOptions.filter((vaultTimeoutOption) => {
      // Always include the custom option
      if (vaultTimeoutOption.value === VaultTimeoutInputComponent.CUSTOM_VALUE) {
        return true;
      }

      if (typeof vaultTimeoutOption.value === "number") {
        // Include numeric values that are less than or equal to the policy minutes
        return vaultTimeoutOption.value <= this.vaultTimeoutPolicy.data.minutes;
      }

      // Exclude all string cases when there's a numeric policy defined
      return false;
    });

    // Only call validator change if it's been set
    if (this.validatorChange) {
      this.validatorChange();
    }
  }
}

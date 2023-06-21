import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

export interface SecretsManagerSubscriptionOptions {
  interval: "year" | "month";
  seatCount: number;
  seatLimit: number;
  seatPrice: number;

  /**
   * The number of service accounts that are included in the base subscription.
   */
  baseServiceAccountCount: number;

  additionalServiceAccountCount: number;
  additionalServiceAccountLimit: number;
  additionalServiceAccountPrice: number;
}

@Component({
  selector: "app-sm-adjust-subscription",
  templateUrl: "sm-adjust-subscription.component.html",
})
export class SecretsManagerAdjustSubscriptionComponent implements OnInit, OnDestroy {
  @Input() organizationId: string;
  @Input() options: SecretsManagerSubscriptionOptions;
  @Output() onAdjusted = new EventEmitter();

  private destroy$ = new Subject<void>();

  formGroup = this.formBuilder.group({
    seatCount: [0, [Validators.required, Validators.min(0)]],
    limitSeats: [false],
    seatLimit: [null as number | null],
    serviceAccountCount: [0, [Validators.required, Validators.min(0)]],
    limitServiceAccounts: [false],
    serviceAccountLimit: [null as number | null],
  });

  get monthlyServiceAccountPrice(): number {
    return this.options.interval == "month"
      ? this.options.additionalServiceAccountPrice
      : Math.round((this.options.additionalServiceAccountPrice / 12 + Number.EPSILON) * 100) / 100;
  }

  get serviceAccountTotal(): number {
    return Math.abs(
      this.formGroup.value.serviceAccountCount * this.options.additionalServiceAccountPrice
    );
  }

  get seatTotal(): number {
    return Math.abs(this.formGroup.value.seatCount * this.options.seatPrice);
  }

  get maxServiceAccountTotal(): number {
    return Math.abs(
      (this.formGroup.value.serviceAccountLimit ?? 0) * this.options.additionalServiceAccountPrice
    );
  }

  get maxSeatTotal(): number {
    return Math.abs((this.formGroup.value.seatLimit ?? 0) * this.options.seatPrice);
  }

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      const seatLimitControl = this.formGroup.controls.seatLimit;
      const serviceAccountLimitControl = this.formGroup.controls.serviceAccountLimit;

      if (value.limitSeats) {
        seatLimitControl.setValidators([Validators.required, Validators.min(value.seatCount)]);
        seatLimitControl.enable({ emitEvent: false });
      } else {
        seatLimitControl.disable({ emitEvent: false });
      }

      if (value.limitServiceAccounts) {
        serviceAccountLimitControl.setValidators([
          Validators.required,
          Validators.min(value.serviceAccountCount),
        ]);
        serviceAccountLimitControl.enable({ emitEvent: false });
      } else {
        serviceAccountLimitControl.disable({ emitEvent: false });
      }
    });

    this.formGroup.patchValue({
      seatCount: this.options.seatCount,
      seatLimit: this.options.seatLimit,
      serviceAccountCount: this.options.additionalServiceAccountCount,
      serviceAccountLimit: this.options.additionalServiceAccountLimit,
      limitSeats: this.options.seatLimit != null,
      limitServiceAccounts: this.options.additionalServiceAccountLimit != null,
    });
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    // TODO: Make the request to update the subscription

    this.onAdjusted.emit();
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

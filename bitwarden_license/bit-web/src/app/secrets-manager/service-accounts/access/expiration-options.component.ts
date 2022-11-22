import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "sm-expiration-options",
  templateUrl: "./expiration-options.component.html",
})
export class ExpirationOptionsComponent implements OnInit {
  private destroy$ = new Subject<void>();

  @Input() formGroup: FormGroup;
  @Input() expirationDayOptions: number[];

  protected form = new FormGroup({
    expires: new FormControl("", [Validators.required]),
    expireDateTime: new FormControl(""),
  });

  async ngOnInit() {
    this.formGroup.addControl("expires", this.form.controls.expires);
    this.formGroup.addControl("expireDateTime", this.form.controls.expireDateTime);

    this.form.controls.expires.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value == "custom") {
        this.form.controls.expireDateTime.setValidators(Validators.required);
      } else {
        this.form.controls.expireDateTime.clearValidators();
        this.form.controls.expireDateTime.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getExpiresDate(): Date {
    if (this.formGroup.value.expires == "custom") {
      return new Date(this.formGroup.value.expireDateTime);
    }
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + Number(this.formGroup.value.expires));
    return currentDate;
  }
}

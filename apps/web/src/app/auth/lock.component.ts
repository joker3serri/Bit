import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

import { LockComponent as BaseLockComponent } from "@bitwarden/angular/auth/components/lock.component";

import { SharedModule } from "../shared";

@Component({
  selector: "app-lock",
  templateUrl: "lock.component.html",
  standalone: true,
  imports: [SharedModule],
})
export class LockComponent extends BaseLockComponent {
  formBuilder = inject(FormBuilder);

  formGroup = this.formBuilder.group({
    masterPassword: ["", Validators.required],
  });

  get masterPasswordFormControl() {
    return this.formGroup.controls.masterPassword;
  }

  async ngOnInit() {
    await super.ngOnInit();

    this.masterPasswordFormControl.setValue(this.masterPassword);

    this.onSuccessfulSubmit = async () => {
      await this.router.navigateByUrl(this.successRoute);
    };
  }

  async superSubmit() {
    await super.submit();
  }

  submit = async () => {
    this.masterPassword = this.masterPasswordFormControl.value;
    await this.superSubmit();
  };
}

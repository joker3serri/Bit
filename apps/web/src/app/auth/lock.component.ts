import { Component } from "@angular/core";

import { LockComponent as BaseLockComponent } from "@bitwarden/angular/auth/components/lock.component";

@Component({
  selector: "app-lock",
  templateUrl: "lock.component.html",
})
export class LockComponent extends BaseLockComponent {
  async ngOnInit() {
    await super.ngOnInit();
    this.onSuccessfulSubmit = async () => {
      this.router.navigateByUrl(this.successRoute);
    };
  }
}

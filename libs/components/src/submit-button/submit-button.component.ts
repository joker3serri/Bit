import { Component, Input } from "@angular/core";

import { ButtonTypes } from "../button";

@Component({
  selector: "bit-submit-button",
  template: `
    <button bitButton type="submit" [buttonType]="buttonType" [disabled]="loading || disabled">
      <span class="tw-relative">
        <span [ngClass]="{ 'tw-invisible': loading }">
          <ng-content></ng-content>
        </span>
        <span class="tw-absolute tw-inset-0" [ngClass]="{ 'tw-invisible': !loading }">
          <i class="bwi bwi-spinner bwi-lg bwi-spin tw-align-baseline" aria-hidden="true"></i>
        </span>
      </span>
    </button>
  `,
})
export class SubmitButtonComponent {
  @Input() buttonType: ButtonTypes = "primary";
  @Input() disabled = false;
  @Input() loading: boolean;
}

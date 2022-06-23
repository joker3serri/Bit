import { Component } from "@angular/core";

@Component({
  selector: "bit-submit-button",
  template: `
    <button bitButton type="submit">
      <span [hidden]="false"><ng-content></ng-content></span>
      <i class="bwi bwi-spinner bwi-lg bwi-spin" [hidden]="true" aria-hidden="true"></i>
    </button>
  `,
})
export class SubmitButtonComponent {}

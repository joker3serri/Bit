import { Component, Input } from "@angular/core";

@Component({
  selector: "auth-two-factor-icon",
  templateUrl: "./two-factor-icon.component.html",
})
export class TwoFactorIconComponent {
  @Input() provider: any;
  @Input() name: string;

  constructor() {}
}

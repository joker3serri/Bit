import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";

import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";

@Component({
  templateUrl: "more-from-bitwarden-page.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, RouterModule, PopOutComponent],
})
export class MoreFromBitwardenPageComponent {
  constructor() {}
}

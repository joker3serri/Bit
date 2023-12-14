import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";

/**
 * Component for the Danger Zone section of the Account/Organization Settings page.
 */
@Component({
  selector: "app-danger-zone",
  templateUrl: "danger-zone.component.html",
  standalone: true,
  imports: [JslibModule],
})
export class DangerZoneComponent {}

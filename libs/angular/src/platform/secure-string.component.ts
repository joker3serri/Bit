import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { SecureString } from "../../../platform/src/secure-memory/secure-string";

@Component({
  imports: [CommonModule],
  selector: "app-secure-string",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secure-string.component.html",
  standalone: true,
})
export class SecureStringComponent {
  @Input()
  protected string?: SecureString;

  constructor(private domSanitizer: DomSanitizer) {}

  character(index: number) {
    return this.domSanitizer.bypassSecurityTrustHtml(`&#${this.string?.data[index]};`);
  }
}

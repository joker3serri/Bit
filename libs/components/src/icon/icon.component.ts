import { Component, Input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import { Icon, isIcon } from "./icon";

@Component({
  selector: "bit-icon",
  template: `<div *ngIf="html" [outerHTML]="html"></div>`,
})
export class BitIconComponent {
  protected html: SafeHtml;

  @Input() set icon(icon: Icon) {
    if (!isIcon(icon)) {
      this.html = "";
      return;
    }

    const svg = icon.svg;
    this.html = this.domSanitizer.bypassSecurityTrustHtml(svg);
  }

  constructor(private domSanitizer: DomSanitizer) {}
}

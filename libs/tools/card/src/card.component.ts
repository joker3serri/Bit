import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { TypographyModule } from "@bitwarden/components";

@Component({
  selector: "tools-card",
  templateUrl: "./card.component.html",
  standalone: true,
  imports: [CommonModule, TypographyModule, JslibModule],
  host: {
    class:
      "tw-box-border tw-bg-background tw-block tw-text-main tw-border-solid tw-border tw-border-secondary-300 tw-border [&:not(bit-layout_*)]:tw-rounded-lg tw-p-6",
  },
})
export class CardComponent {
  @Input() title: string;
  @Input() value: number;
  @Input() maxValue: number;
}

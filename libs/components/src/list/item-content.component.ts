import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "bit-item-content, [bit-item-content]",
  standalone: true,
  imports: [CommonModule],
  templateUrl: `item-content.component.html`,
  host: {
    class:
      "fvw-target tw-outline-none tw-text-main hover:tw-text-main hover:tw-no-underline tw-text-base tw-p-4 tw-bg-transparent tw-w-full tw-border-none tw-flex tw-gap-4 tw-items-center tw-justify-between",
  },
})
export class ItemContentComponent {}

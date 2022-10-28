import { Directive, HostBinding, Input } from "@angular/core";

@Directive({
  selector: "tr[bitRow]",
})
export class RowDirective {
  @Input() alignContent: "top" | "middle" | "bottom" | "baseline" = "baseline";

  get alignmentClass(): string {
    return `tw-align-${this.alignContent}`;
  }

  @HostBinding("class") get classList() {
    return [
      "tw-border-0",
      "tw-border-b",
      "tw-border-secondary-300",
      "tw-border-solid",
      "hover:tw-bg-background-alt",
      "last:tw-border-0",
      this.alignmentClass,
    ];
  }
}

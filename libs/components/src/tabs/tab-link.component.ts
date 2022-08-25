import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-tab-link",
  templateUrl: "tab-link.component.html",
})
export class TabLinkComponent {
  @Input() route: string;

  @Input() disabled = false;

  get classList(): string[] {
    return this.baseClassList.concat(this.disabled ? this.disabledClassList : []);
  }

  get baseClassList(): string[] {
    return [
      "tw-block",
      "tw-relative",
      "tw-py-2",
      "tw-px-4",
      "tw-font-semibold",
      "tw-transition",
      "tw-rounded-t",
      "tw-border-0",
      "tw-border-x",
      "tw-border-t-4",
      "tw-border-transparent",
      "tw-border-solid",
      "tw-bg-background",
      "!tw-text-main",
      "hover:tw-underline",
      "hover:!tw-text-main",
      "focus-visible:tw-z-10",
      "focus-visible:tw-outline-none",
      "focus-visible:tw-ring-2",
      "focus-visible:tw-ring-primary-700",
      "disabled:tw-bg-secondary-100",
      "disabled:!tw-text-muted/60",
      "disabled:hover:!tw-text-muted/60",
      "disabled:tw-no-underline",
      "disabled:tw-cursor-not-allowed",
    ];
  }

  get disabledClassList(): string[] {
    return [
      "!tw-bg-secondary-100",
      "!tw-text-muted/60",
      "hover:!tw-text-muted/60",
      "!tw-no-underline",
      "tw-cursor-not-allowed",
    ];
  }

  get activeClassList(): string {
    return [
      "tw--mb-px",
      "tw-border-x-secondary-300",
      "tw-border-t-primary-500",
      "tw-border-b",
      "tw-border-b-background",
      "tw-bg-background",
      "!tw-text-primary-500",
      "hover:tw-border-t-primary-700",
      "hover:!tw-text-primary-700",
      "focus-visible:tw-border-t-primary-700",
      "focus-visible:!tw-text-primary-700",
    ].join(" ");
  }
}

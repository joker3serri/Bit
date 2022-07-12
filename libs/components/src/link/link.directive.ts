import { Input, HostBinding, Directive } from "@angular/core";

export type LinkTypes = "primary" | "secondary" | "contrast";

const linkStyles: Record<LinkTypes, string[]> = {
  primary: [
    "tw-text-primary-500",
    "hover:tw-text-primary-500",
    "focus:tw-ring-primary-700",
    "disabled:tw-text-muted",
  ],
  secondary: [
    "tw-text-main",
    "hover:tw-text-main",
    "focus:tw-ring-primary-700",
    "disabled:tw-text-muted",
  ],
  contrast: [
    "tw-text-contrast",
    "hover:tw-text-contrast",
    "focus:tw-ring-text-contrast",
    "disabled:tw-text-contrast/80",
  ],
};

@Directive({
  selector: "button[bitLink], a[bitLink]",
})
export class LinkDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-font-semibold",
      "tw-py-1",
      "tw-px-3",
      "tw-bg-transparent",
      "tw-border-0",
      "tw-border-transparent",
      "tw-border-none",
      "tw-rounded",
      "tw-transition",
      "hover:tw-underline",
      "hover:tw-decoration-1",
      "focus:tw-outline-none",
      "focus:tw-underline",
      "focus:tw-decoration-1",
      "focus:tw-ring",
      "focus:tw-z-10", // Necessary?
      "disabled:tw-no-underline",
      "disabled:tw-cursor-not-allowed",
    ].concat(linkStyles[this.linkType] ?? []);
  }

  @Input()
  linkType: LinkTypes = "primary";
}

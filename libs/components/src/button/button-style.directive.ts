import { HostBinding, Directive } from "@angular/core";

@Directive({
  selector: "[bitButton][bitPrimary]",
})
export class ButtonPrimaryDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-border-primary-500",
      "tw-bg-primary-500",
      "!tw-text-contrast",
      "hover:tw-bg-primary-700",
      "hover:tw-border-primary-700",
      "disabled:tw-bg-primary-500/60",
      "disabled:tw-border-primary-500/60",
      "disabled:!tw-text-contrast/60",
      "disabled:tw-bg-clip-padding",
    ];
  }
}

@Directive({
  selector: "[bitButton][bitSecondary]",
})
export class ButtonSecondaryDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "tw-border-text-muted",
      "!tw-text-muted",
      "hover:tw-bg-secondary-500",
      "hover:tw-border-secondary-500",
      "hover:!tw-text-contrast",
      "disabled:tw-bg-transparent",
      "disabled:tw-border-text-muted/60",
      "disabled:!tw-text-muted/60",
    ];
  }
}

@Directive({
  selector: "[bitButton][bitDanger]",
})
export class ButtonDangerDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "tw-border-danger-500",
      "!tw-text-danger",
      "hover:tw-bg-danger-500",
      "hover:tw-border-danger-500",
      "hover:!tw-text-contrast",
      "disabled:tw-bg-transparent",
      "disabled:tw-border-danger-500/60",
      "disabled:!tw-text-danger/60",
    ];
  }
}

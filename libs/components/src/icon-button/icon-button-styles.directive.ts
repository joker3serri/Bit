import { Directive, HostBinding } from "@angular/core";

@Directive({
  selector: "[bitIconButton][bitPrimary]",
})
export class IconButtonPrimaryDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-primary-500",
      "!tw-text-contrast",
      "tw-border-primary-500",
      "hover:tw-bg-primary-700",
      "hover:tw-border-primary-700",
      "focus-visible:before:tw-ring-primary-700",
      "disabled:hover:tw-border-primary-500",
      "disabled:hover:tw-bg-primary-500",
      "disabled:tw-opacity-60",
    ];
  }
}

@Directive({
  selector: "[bitIconButton][bitSecondary]",
})
export class IconButtonSecondaryDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "!tw-text-muted",
      "tw-border-text-muted",
      "hover:!tw-text-contrast",
      "hover:tw-bg-text-muted",
      "focus-visible:before:tw-ring-primary-700",
      "disabled:hover:tw-border-text-muted",
      "disabled:hover:tw-bg-transparent",
      "disabled:hover:!tw-text-muted",
      "disabled:hover:tw-border-text-muted",
      "disabled:tw-opacity-60",
    ];
  }
}

@Directive({
  selector: "[bitIconButton][bitDanger]",
})
export class IconButtonDangerDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "!tw-text-danger",
      "tw-border-danger-500",
      "hover:!tw-text-contrast",
      "hover:tw-bg-danger-500",
      "focus-visible:before:tw-ring-primary-700",
      "disabled:hover:tw-border-danger-500",
      "disabled:hover:tw-bg-transparent",
      "disabled:hover:!tw-text-danger",
      "disabled:hover:tw-border-danger-500",
      "disabled:tw-opacity-60",
    ];
  }
}

@Directive({
  selector: "[bitIconButton][bitMain]",
})
export class IconButtonMainDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "!tw-text-main",
      "tw-border-transparent",
      "hover:tw-bg-transparent-hover",
      "hover:tw-border-text-main",
      "focus-visible:before:tw-ring-text-main",
      "disabled:hover:tw-border-transparent",
      "disabled:hover:tw-bg-transparent",
      "disabled:tw-opacity-60",
    ];
  }
}

@Directive({
  selector: "[bitIconButton][bitMuted]",
})
export class IconButtonMutedDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "!tw-text-muted",
      "tw-border-transparent",
      "hover:tw-bg-transparent-hover",
      "hover:tw-border-primary-700",
      "focus-visible:before:tw-ring-primary-700",
      "disabled:hover:tw-border-transparent",
      "disabled:hover:tw-bg-transparent",
      "disabled:tw-opacity-60",
    ];
  }
}

@Directive({
  selector: "[bitIconButton][bitContrast]",
})
export class IconButtonContrastDirective {
  @HostBinding("class") get classList() {
    return [
      "tw-bg-transparent",
      "!tw-text-contrast",
      "tw-border-transparent",
      "hover:tw-bg-transparent-hover",
      "hover:tw-border-text-contrast",
      "focus-visible:before:tw-ring-text-contrast",
      "disabled:hover:tw-border-transparent",
      "disabled:hover:tw-bg-transparent",
      "disabled:tw-opacity-60",
    ];
  }
}

import { Directive, HostBinding } from "@angular/core";

@Directive({
  selector:
    "[bitButton][bitPrefix],[bitButton][bitSuffix],[bitIconButton][bitPrefix],[bitIconButton][bitSuffix]",
})
export class BitPrefixSuffixButtonDirective {
  @HostBinding("class") get classList() {
    return [
      "hover:tw-bg-text-muted",
      "hover:tw-text-contrast",
      "disabled:tw-opacity-100",
      "disabled:tw-bg-secondary-100",
      "disabled:hover:tw-bg-secondary-100",
      "disabled:hover:tw-text-muted",
    ];
  }
}

@Directive({
  selector: "[bitIconButton][bitPrefix],[bitIconButton][bitSuffix]",
})
export class BitPrefixSuffixIconButtonDirective {
  @HostBinding("class") get classList() {
    return ["bwi-lg"];
  }
}

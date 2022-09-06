import { Directive } from "@angular/core";

/**
 * Directive used for styling the container for bit tab labels
 */
@Directive({
  selector: "[bit-tab-list-container]",
  host: {
    class:
      "tw-inline-flex tw-flex-wrap tw-border-0 tw-border-b tw-border-solid tw-border-secondary-300 tw-leading-5",
  },
})
export class TabListContainerDirective {}

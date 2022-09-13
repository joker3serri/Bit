import { Component } from "@angular/core";

/**
 * Component used for styling the tab header/background for both content and navigation tabs
 */
@Component({
  selector: "bit-tab-header",
  host: {
    class: "tw-h-16 tw-pl-4 tw-bg-background-alt tw-flex tw-items-end",
  },
  template: `<ng-content></ng-content>`,
})
export class TabHeaderComponent {}

import { Directive, HostBinding, HostListener, Input } from "@angular/core";

import { DisclosureComponent } from "./disclosure.component";

let nextId = 0;

@Directive({
  selector: "[bitDisclosureTriggerFor]",
  exportAs: "disclosureTriggerFor",
  standalone: true,
})
export class DisclosureTriggerForDirective {
  /**
   * Accepts template reference for a bit-disclosure component instance
   */
  @Input("bitDisclosureTriggerFor") disclosure: DisclosureComponent;

  @HostBinding("id") id = `bit-trigger-for-${nextId++}`;

  @HostBinding("attr.aria-expanded") get ariaExpanded() {
    return this.disclosure.open;
  }

  @HostBinding("attr.aria-controls") get ariaControls() {
    return this.id;
  }

  @HostListener("click") click() {
    this.disclosure.open = !this.disclosure.open;
  }
}

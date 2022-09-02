import { Component, ContentChild, Directive, HostBinding } from "@angular/core";

// Increments for each instance of this component
let nextId = 0;

@Directive({ selector: "[bit-dialog-icon]" })
export class IconDirective {}

@Component({
  selector: "bit-simple-dialog",
  templateUrl: "./simple-dialog.component.html",
})
export class SimpleDialogComponent {
  @HostBinding() role = "dialog";
  @HostBinding("attr.aria-labelledby") dialogTitleId = `bit-simple-dialog-title-${nextId++}`;

  @ContentChild(IconDirective) icon!: IconDirective;

  get hasIcon() {
    return this.icon != null;
  }
}

import { Component, HostBinding, Input } from "@angular/core";

// Increments for each instance of this component
let nextId = 0;

@Component({
  selector: "bit-dialog",
  templateUrl: "./dialog.component.html",
})
export class DialogComponent {
  @HostBinding() role = "dialog";
  @HostBinding("attr.aria-labelledby") dialogTitleId = `bit-dialog-title-${nextId++}`;

  @Input() dialogSize: "small" | "default" | "large" = "default";

  get width() {
    switch (this.dialogSize) {
      case "small": {
        return "tw-w-96";
      }
      case "large": {
        return "tw-w-75vw";
      }
      default: {
        return "tw-w-50vw";
      }
    }
  }
}

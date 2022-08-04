import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-dialog",
  templateUrl: "./dialog.component.html",
})
export class DialogComponent {
  @Input() dialogSize: "small" | "default" | "large" = "default";

  get width() {
    switch (this.dialogSize) {
      case "small": {
        return "tw-max-w-xs";
      }
      case "large": {
        return "tw-max-w-4xl";
      }
      default: {
        return "tw-max-w-xl";
      }
    }
  }
}

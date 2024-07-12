import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, HostBinding, Input } from "@angular/core";

import { fadeIn } from "../animations";

@Component({
  selector: "bit-dialog",
  templateUrl: "./dialog.component.html",
  animations: [fadeIn],
})
export class DialogComponent {
  /** Background color */
  @Input()
  background: "default" | "alt" = "default";

  /**
   * Dialog size, more complex dialogs should use large, otherwise default is fine.
   */
  @Input() dialogSize: "small" | "default" | "large" = "default";

  /**
   * Title to show in the dialog's header
   */
  @Input() title: string;

  /**
   * Subtitle to show in the dialog's header
   */
  @Input() subtitle: string;

  private _disablePadding = false;
  /**
   * Disable the built-in padding on the dialog, for use with tabbed dialogs.
   */
  @Input() set disablePadding(value: boolean | "") {
    this._disablePadding = coerceBooleanProperty(value);
  }
  get disablePadding() {
    return this._disablePadding;
  }

  /**
   * Mark the dialog as loading which replaces the content with a spinner.
   */
  @Input() loading = false;

  @HostBinding("class") get classes() {
    return ["tw-flex", "tw-flex-col", "tw-max-h-screen", "tw-w-screen"].concat(
      this.width.split(" "),
    );
  }

  get width() {
    switch (this.dialogSize) {
      case "small": {
        return "tw-max-w-sm tw-p-4";
      }
      case "large": {
        return "tw-max-w-3xl";
      }
      default: {
        return "tw-max-w-xl tw-p-4";
      }
    }
  }
}

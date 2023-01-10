import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SimpleDialogCloseType } from "./models/simple-dialog-close-type.enum";
import { SimpleDialogOptions } from "./models/simple-dialog-options";
import { SimpleDialogType } from "./models/simple-dialog-type.enum";
import { isTranslation } from "./models/translation";

const DEFAULT_ICON: Record<SimpleDialogType, string> = {
  [SimpleDialogType.PRIMARY]: "bwi-business",
  [SimpleDialogType.SUCCESS]: "bwi-star",
  [SimpleDialogType.INFO]: "bwi-info-circle",
  [SimpleDialogType.WARNING]: "bwi-exclamation-triangle",
  [SimpleDialogType.DANGER]: "bwi-error",
};

const DEFAULT_COLOR: Record<SimpleDialogType, string> = {
  [SimpleDialogType.PRIMARY]: "tw-text-primary-500",
  [SimpleDialogType.SUCCESS]: "tw-text-success",
  [SimpleDialogType.INFO]: "tw-text-info",
  [SimpleDialogType.WARNING]: "tw-text-warning",
  [SimpleDialogType.DANGER]: "tw-text-danger",
};

@Component({
  selector: "bit-simple-configurable-dialog",
  templateUrl: "./simple-configurable-dialog.component.html",
})
export class SimpleConfigurableDialogComponent {
  SimpleDialogType = SimpleDialogType;
  SimpleDialogCloseType = SimpleDialogCloseType;

  get iconClasses() {
    return [
      this.simpleDialogOpts.icon ?? DEFAULT_ICON[this.simpleDialogOpts.type],
      DEFAULT_COLOR[this.simpleDialogOpts.type],
    ];
  }

  constructor(
    public dialogRef: DialogRef,
    private i18nService: I18nService,
    @Inject(DIALOG_DATA) public simpleDialogOpts?: SimpleDialogOptions
  ) {
    // Assume localized
    if (this.simpleDialogOpts.isLocalized === undefined) {
      this.simpleDialogOpts.isLocalized = true;
    } else if (!this.simpleDialogOpts.isLocalized) {
      // Must localize title, content, and button texts.
      this.localizeText();
    }
  }

  private localizeText() {
    const undefArray: any[] = [undefined, undefined, undefined];
    let p1: string | number, p2: string | number, p3: string | number;

    if (isTranslation(this.simpleDialogOpts.title)) {
      [p1, p2, p3] = this.simpleDialogOpts.title.placeholderValues || undefArray;
      this.simpleDialogOpts.title = this.i18nService.t(this.simpleDialogOpts.title.key, p1, p2, p3);
    }

    if (isTranslation(this.simpleDialogOpts.content)) {
      [p1, p2, p3] = this.simpleDialogOpts.content.placeholderValues || undefArray;
      this.simpleDialogOpts.content = this.i18nService.t(
        this.simpleDialogOpts.content.key,
        p1,
        p2,
        p3
      );
    }

    if (
      this.simpleDialogOpts.acceptButtonText !== undefined &&
      isTranslation(this.simpleDialogOpts.acceptButtonText)
    ) {
      [p1, p2, p3] = this.simpleDialogOpts.acceptButtonText.placeholderValues || undefArray;
      this.simpleDialogOpts.acceptButtonText = this.i18nService.t(
        this.simpleDialogOpts.acceptButtonText.key,
        p1,
        p2,
        p3
      );
    }

    if (
      this.simpleDialogOpts.cancelButtonText !== undefined &&
      isTranslation(this.simpleDialogOpts.cancelButtonText)
    ) {
      [p1, p2, p3] = this.simpleDialogOpts.cancelButtonText.placeholderValues || undefArray;
      this.simpleDialogOpts.cancelButtonText = this.i18nService.t(
        this.simpleDialogOpts.cancelButtonText.key,
        p1,
        p2,
        p3
      );
    }
  }
}

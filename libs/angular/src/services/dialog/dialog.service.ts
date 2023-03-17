import {
  DialogRef,
  DialogConfig,
  Dialog,
  DEFAULT_DIALOG_CONFIG,
  DIALOG_SCROLL_STRATEGY,
} from "@angular/cdk/dialog";
import { Overlay, OverlayContainer } from "@angular/cdk/overlay";
import { ComponentType } from "@angular/cdk/portal";
import { Inject, Injector, Optional, SkipSelf, TemplateRef } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { DialogServiceAbstraction } from "./dialog.service.abstraction";
import { SimpleDialogOptions } from "./simple-dialog-options";
import { SimpleDialogType } from "./simple-dialog-type";
import { Translation } from "./translation";

// This is a temporary base class for Dialogs. It is intended to be removed once the Component Library is adoped by each app.
export abstract class DialogService extends Dialog implements DialogServiceAbstraction {
  constructor(
    /** Parent class constructor */
    _overlay: Overlay,
    _injector: Injector,
    @Optional() @Inject(DEFAULT_DIALOG_CONFIG) _defaultOptions: DialogConfig,
    @Optional() @SkipSelf() _parentDialog: Dialog,
    _overlayContainer: OverlayContainer,
    @Inject(DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
    protected i18nService: I18nService
  ) {
    super(_overlay, _injector, _defaultOptions, _parentDialog, _overlayContainer, scrollStrategy);
  }

  async openSimpleDialog(simpleDialogOptions: SimpleDialogOptions) {
    return this.legacyShowDialog(
      this.translate(simpleDialogOptions.content),
      this.translate(simpleDialogOptions.title),
      this.translate(simpleDialogOptions.acceptButtonText),
      this.translate(simpleDialogOptions.cancelButtonText),
      simpleDialogOptions.type
    );
  }

  legacyShowDialog(
    body: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    type?: SimpleDialogType
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  openSimpleDialogRef(simpleDialogOptions: SimpleDialogOptions): DialogRef {
    throw new Error("Method not implemented.");
  }

  override open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    throw new Error("Method not implemented.");
  }

  private translate(translation: string | Translation, defaultKey?: string): string {
    // Translation interface use implies we must localize.
    if (typeof translation === "object") {
      return this.i18nService.t(translation.key, ...translation.placeholders);
    }

    // Use string that is already translated or use default key post translate
    return translation ?? this.i18nService.t(defaultKey);
  }
}

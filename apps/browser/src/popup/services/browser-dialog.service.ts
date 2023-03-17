import {
  DEFAULT_DIALOG_CONFIG,
  Dialog,
  DialogConfig,
  DIALOG_SCROLL_STRATEGY,
} from "@angular/cdk/dialog";
import { Overlay, OverlayContainer } from "@angular/cdk/overlay";
import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf } from "@angular/core";

import { DialogService, SimpleDialogType } from "@bitwarden/angular/services/dialog";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";

import { DialogResolverService } from "../../services/dialog-resolver.service";

export const BACKGROUND_MESSAGING_SERVICE = new InjectionToken<MessagingService>(
  "BACKGROUND_MESSAGING_SERVICE"
);

@Injectable()
export class BrowserDialogService extends DialogService {
  constructor(
    /** Parent class constructor */
    _overlay: Overlay,
    _injector: Injector,
    @Optional() @Inject(DEFAULT_DIALOG_CONFIG) _defaultOptions: DialogConfig,
    @Optional() @SkipSelf() _parentDialog: Dialog,
    _overlayContainer: OverlayContainer,
    @Inject(DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
    protected i18nService: I18nService,
    @Inject(BACKGROUND_MESSAGING_SERVICE) protected messagingService: MessagingService,
    protected dialogResolverService: DialogResolverService
  ) {
    super(
      _overlay,
      _injector,
      _defaultOptions,
      _parentDialog,
      _overlayContainer,
      scrollStrategy,
      i18nService
    );
  }

  async legacyShowDialog(
    body: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    type?: SimpleDialogType
  ) {
    const dialogId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.messagingService.send("showDialog", {
      text: body,
      title: title,
      confirmText: confirmText,
      cancelText: cancelText,
      type: type,
      dialogId: dialogId,
    });

    return this.dialogResolverService.await(dialogId);
  }
}

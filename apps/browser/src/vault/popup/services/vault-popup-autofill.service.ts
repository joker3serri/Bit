import { Injectable } from "@angular/core";
import {
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherRepromptType, CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import { ToastService } from "@bitwarden/components";
import { PasswordRepromptService } from "@bitwarden/vault";

import {
  AutofillService,
  PageDetail,
} from "../../../autofill/services/abstractions/autofill.service";
import { BrowserApi } from "../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../platform/popup/browser-popup-utils";

@Injectable({
  providedIn: "root",
})
export class VaultPopupAutofillService {
  private _refreshCurrentTab$ = new Subject<void>();
  private _pageDetailsSubscription: Subscription;

  /**
   * Observable that contains the current tab to be considered for autofill. If there is no current tab
   * or the popup is in a popout window, this will be null.
   */
  currentAutofillTab$: Observable<chrome.tabs.Tab | null> = this._refreshCurrentTab$.pipe(
    startWith(null),
    switchMap(async () => {
      if (BrowserPopupUtils.inPopout(window)) {
        return null;
      }
      return await BrowserApi.getTabFromCurrentWindow();
    }),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  /**
   * Observable that indicates whether autofill is allowed in the current context.
   * Autofill is allowed when there is a current tab and the popup is not in a popout window.
   */
  autofillAllowed$: Observable<boolean> = this.currentAutofillTab$.pipe(map((tab) => !!tab));

  private _currentPageDetails$: Observable<PageDetail[]> = this.currentAutofillTab$.pipe(
    switchMap((tab) => {
      if (!tab) {
        return of([]);
      }
      return this.autofillService.collectPageDetailsFromTab$(tab);
    }),
    shareReplay({ refCount: false, bufferSize: 1 }),
  );

  constructor(
    private autofillService: AutofillService,
    private i18nService: I18nService,
    private toastService: ToastService,
    private platformUtilService: PlatformUtilsService,
    private passwordRepromptService: PasswordRepromptService,
    private cipherService: CipherService,
    private messagingService: MessagingService,
    private logService: LogService,
  ) {}

  /**
   * Start a subscription to the collect page details from the current tab.
   *
   * The page details collection process has no definite 'end', so we must keep a subscription alive
   * to ensure that the most up-to-date page details are always available for autofill.
   *
   * This method should be called early whenever autofill may be needed, such as when the popup is opened.
   */
  startCollectingPageDetails() {
    if (this._pageDetailsSubscription && !this._pageDetailsSubscription.closed) {
      return;
    }
    this._pageDetailsSubscription = this._currentPageDetails$.subscribe();
  }

  /**
   * Stop the subscription to collect the page details from the current tab.
   *
   * This can be called when navigating away from the vault or wherever autofill is no longer needed.
   */
  stopCollectingPageDetails() {
    if (this._pageDetailsSubscription && !this._pageDetailsSubscription.closed) {
      this._pageDetailsSubscription.unsubscribe();
      this._pageDetailsSubscription = null;
    }
  }

  /**
   * Helper to log a warning if there is an attempt to autofill without an active page details subscription.
   * @private
   */
  private _warnIfMissingPageDetailsSub() {
    if (!this._pageDetailsSubscription || this._pageDetailsSubscription.closed) {
      this.logService.warning(
        "Page details subscription is not active. Page details may not be available in time for autofill.",
      );
    }
  }

  private async _internalDoAutofill(
    cipher: CipherView,
    tab: chrome.tabs.Tab,
    pageDetails: PageDetail[],
  ): Promise<boolean> {
    if (
      cipher.reprompt !== CipherRepromptType.None &&
      !(await this.passwordRepromptService.showPasswordPrompt())
    ) {
      return false;
    }

    if (tab == null || pageDetails.length === 0) {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("autofillError"),
      });
      return false;
    }

    try {
      const totpCode = await this.autofillService.doAutoFill({
        tab,
        cipher,
        pageDetails,
        doc: window.document,
        fillNewPassword: true,
        allowTotpAutofill: true,
      });

      if (totpCode != null) {
        this.platformUtilService.copyToClipboard(totpCode, { window: window });
      }
    } catch {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("autofillError"),
      });
      return false;
    }

    return true;
  }

  private _closePopup() {
    if (!BrowserPopupUtils.inPopup(window)) {
      return;
    }

    if (this.platformUtilService.isFirefox() || this.platformUtilService.isSafari()) {
      BrowserApi.closePopup(window);
      return;
    }

    // Slight delay to fix bug in Chromium browsers where popup closes without copying totp to clipboard
    setTimeout(() => BrowserApi.closePopup(window), 50);
  }

  /**
   * Re-fetch the current tab
   */
  refreshCurrentTab() {
    this._refreshCurrentTab$.next(null);
  }

  /**
   * Attempts to autofill the given cipher. Returns true if the autofill was successful, false otherwise.
   * Will copy any TOTP code to the clipboard if available after successful autofill.
   * @param cipher
   * @param closePopup If true, will close the popup window after successful autofill. Defaults to true.
   */
  async doAutofill(cipher: CipherView, closePopup = true): Promise<boolean> {
    this._warnIfMissingPageDetailsSub();

    const tab = await firstValueFrom(this.currentAutofillTab$);
    const pageDetails = await firstValueFrom(this._currentPageDetails$);

    const didAutofill = await this._internalDoAutofill(cipher, tab, pageDetails);

    if (didAutofill && closePopup) {
      this._closePopup();
    }

    return didAutofill;
  }

  /**
   * Attempts to autofill the given cipher and, upon successful autofill, saves the URI to the cipher.
   * Will copy any TOTP code to the clipboard if available after successful autofill.
   * @param cipher The cipher to autofill and save. Only Login ciphers are supported.
   * @param closePopup If true, will close the popup window after successful autofill.
   * If false, will show a success toast instead. Defaults to true.
   */
  async doAutofillAndSave(cipher: CipherView, closePopup = true): Promise<boolean> {
    this._warnIfMissingPageDetailsSub();

    // We can only save URIs for login ciphers
    if (cipher.type !== CipherType.Login) {
      return false;
    }

    const pageDetails = await firstValueFrom(this._currentPageDetails$);
    const tab = await firstValueFrom(this.currentAutofillTab$);

    const didAutofill = await this._internalDoAutofill(cipher, tab, pageDetails);

    if (!didAutofill) {
      return false;
    }

    if (cipher.login.uris == null) {
      cipher.login.uris = [];
    } else if (cipher.login.uris.some((uri) => uri.uri === tab.url)) {
      // Cipher already has a URI for this tab
      if (closePopup) {
        this._closePopup();
      } else {
        this.toastService.showToast({
          variant: "success",
          title: null,
          message: this.i18nService.t("autoFillSuccessAndSavedUri"),
        });
      }
      return true;
    }

    const loginUri = new LoginUriView();
    loginUri.uri = tab.url;
    cipher.login.uris.push(loginUri);

    try {
      const encCipher = await this.cipherService.encrypt(cipher);
      await this.cipherService.updateWithServer(encCipher);
    } catch {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("unexpectedError"),
      });
      return false;
    }

    if (closePopup) {
      this._closePopup();
    } else {
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("autoFillSuccessAndSavedUri"),
      });
    }
    this.messagingService.send("editedCipher");

    return true;
  }
}

import { CommonModule, Location } from "@angular/common";
import { ChangeDetectorRef, Component, DestroyRef, Inject, OnDestroy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, Observable, Subject, Subscription, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { AUTOFILL_ID, SHOW_AUTOFILL_BUTTON } from "@bitwarden/common/autofill/constants";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherRepromptType, CipherType } from "@bitwarden/common/vault/enums";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import {
  AsyncActionsModule,
  SearchModule,
  ButtonModule,
  IconButtonModule,
  DialogService,
  ToastService,
} from "@bitwarden/components";
import { PasswordRepromptService, TotpCaptureService } from "@bitwarden/vault";

import { PageDetail } from "src/autofill/services/abstractions/autofill.service";

import { CipherViewComponent } from "../../../../../../../../libs/vault/src/cipher-view";
import AutofillService from "../../../../../autofill/services/autofill.service";
import { BrowserApi } from "../../../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../../../platform/popup/browser-popup-utils";
import { PopOutComponent } from "../../../../../platform/popup/components/pop-out.component";
import { fido2PopoutSessionData$ } from "../../../../../vault/popup/utils/fido2-popout-session-data";
import {
  closeViewVaultItemPopout,
  VaultPopoutType,
} from "../../../../../vault/popup/utils/vault-popout-window";
import { BrowserTotpCaptureService } from "../../../services/browser-totp-capture.service";

import { BrowserFido2UserInterfaceSession } from "./../../../../../autofill/fido2/services/browser-fido2-user-interface.service";
import { PopupFooterComponent } from "./../../../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "./../../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "./../../../../../platform/popup/layout/popup-page.component";

@Component({
  selector: "app-view-v2",
  templateUrl: "view-v2.component.html",
  standalone: true,
  providers: [{ provide: TotpCaptureService, useClass: BrowserTotpCaptureService }],
  imports: [
    CommonModule,
    SearchModule,
    JslibModule,
    FormsModule,
    ButtonModule,
    PopupPageComponent,
    PopupHeaderComponent,
    PopupFooterComponent,
    IconButtonModule,
    CipherViewComponent,
    AsyncActionsModule,
    PopOutComponent,
  ],
})
export class ViewV2Component implements OnDestroy {
  headerText: string;
  cipher: CipherView;
  organization$: Observable<Organization>;
  folder$: Observable<FolderView>;
  collections$: Observable<CollectionView[]>;

  private destroy$ = new Subject<void>();
  private collectPageDetailsSubscription: Subscription;
  uilocation?: "popout" | "popup" | "sidebar" | "tab";
  pageDetails: PageDetail[] | null = [];
  tab: chrome.tabs.Tab | null;
  senderTabId?: number;
  private fido2PopoutSessionData$ = fido2PopoutSessionData$();
  inPopout = false;
  private passwordReprompted = false;
  totpCode: string;
  loadAction: typeof AUTOFILL_ID | typeof SHOW_AUTOFILL_BUTTON;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private i18nService: I18nService,
    private cipherService: CipherService,
    private dialogService: DialogService,
    private logService: LogService,
    private toastService: ToastService,
    private platformUtilsService: PlatformUtilsService,
    private changeDetectorRef: ChangeDetectorRef,
    private passwordRepromptService: PasswordRepromptService,
    protected eventCollectionService: EventCollectionService,
    private location: Location,
    private autofillService: AutofillService,
    private messagingService: MessagingService,
    private destroyRef: DestroyRef,
    @Inject(WINDOW) protected win: Window,
  ) {
    this.subscribeToParams();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToParams(): void {
    this.route.queryParams
      .pipe(
        switchMap(async (params): Promise<CipherView> => {
          this.loadAction = params.action;
          this.uilocation = params?.uilocation;
          this.senderTabId = params?.senderTabId ? parseInt(params.senderTabId, 10) : undefined;
          return await this.getCipherData(params.cipherId);
        }),
        takeUntilDestroyed(),
      )
      // eslint-disable-next-line rxjs/no-async-subscribe
      .subscribe(async (cipher) => {
        this.cipher = cipher;
        this.headerText = this.setHeader(cipher.type);

        this.inPopout = this.uilocation === "popout" || BrowserPopupUtils.inPopout(this.win);

        await this.loadPageDetails();

        if (this.loadAction === AUTOFILL_ID || this.loadAction === SHOW_AUTOFILL_BUTTON) {
          await this.handleLoadAction();
        }
      });
  }

  setHeader(type: CipherType) {
    switch (type) {
      case CipherType.Login:
        return this.i18nService.t("viewItemHeader", this.i18nService.t("typeLogin").toLowerCase());
      case CipherType.Card:
        return this.i18nService.t("viewItemHeader", this.i18nService.t("typeCard").toLowerCase());
      case CipherType.Identity:
        return this.i18nService.t(
          "viewItemHeader",
          this.i18nService.t("typeIdentity").toLowerCase(),
        );
      case CipherType.SecureNote:
        return this.i18nService.t("viewItemHeader", this.i18nService.t("note").toLowerCase());
    }
  }

  async getCipherData(id: string) {
    const cipher = await this.cipherService.get(id);
    return await cipher.decrypt(await this.cipherService.getKeyForCipherKeyDecryption(cipher));
  }

  async editCipher() {
    if (this.cipher.isDeleted) {
      return false;
    }
    void this.router.navigate(["/edit-cipher"], {
      queryParams: { cipherId: this.cipher.id, type: this.cipher.type, isNew: false },
    });
    return true;
  }

  delete = async (): Promise<boolean> => {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "deleteItem" },
      content: {
        key: this.cipher.isDeleted ? "permanentlyDeleteItemConfirmation" : "deleteItemConfirmation",
      },
      type: "warning",
    });

    if (!confirmed) {
      return false;
    }

    try {
      await this.deleteCipher();
    } catch (e) {
      this.logService.error(e);
      return false;
    }

    await this.router.navigate(["/vault"]);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t(this.cipher.isDeleted ? "permanentlyDeletedItem" : "deletedItem"),
    });

    return true;
  };

  protected deleteCipher() {
    return this.cipher.isDeleted
      ? this.cipherService.deleteWithServer(this.cipher.id)
      : this.cipherService.softDeleteWithServer(this.cipher.id);
  }

  private async loadPageDetails() {
    this.collectPageDetailsSubscription?.unsubscribe();
    this.pageDetails = [];
    this.tab = this.senderTabId
      ? await BrowserApi.getTab(this.senderTabId)
      : await BrowserApi.getTabFromCurrentWindow();

    if (!this.tab) {
      return;
    }

    this.collectPageDetailsSubscription = this.autofillService
      .collectPageDetailsFromTab$(this.tab)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pageDetails) => {
        this.pageDetails = pageDetails;
      });
  }

  async close() {
    const sessionData = await firstValueFrom(this.fido2PopoutSessionData$);
    if (this.inPopout && sessionData.isFido2Session) {
      BrowserFido2UserInterfaceSession.abortPopout(sessionData.sessionId);
      return;
    }

    if (
      BrowserPopupUtils.inSingleActionPopout(window, VaultPopoutType.viewVaultItem) &&
      this.senderTabId
    ) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.focusTab(this.senderTabId);
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      closeViewVaultItemPopout(`${VaultPopoutType.viewVaultItem}_${this.cipher.id}`);
      return;
    }

    this.location.back();
  }

  protected async promptPassword() {
    if (this.cipher.reprompt === CipherRepromptType.None || this.passwordReprompted) {
      return true;
    }

    return (this.passwordReprompted = await this.passwordRepromptService.showPasswordPrompt());
  }

  private async handleLoadAction() {
    let loadActionSuccess = false;
    loadActionSuccess = await this.fillCipher();

    if (this.inPopout) {
      setTimeout(() => this.close(), loadActionSuccess ? 1000 : 0);
    }
  }

  private async doAutofill() {
    const originalTabURL = this.tab.url?.length && new URL(this.tab.url);

    if (!(await this.promptPassword())) {
      return false;
    }

    const currentTabURL = this.tab.url?.length && new URL(this.tab.url);

    const originalTabHostPath =
      originalTabURL && `${originalTabURL.origin}${originalTabURL.pathname}`;
    const currentTabHostPath = currentTabURL && `${currentTabURL.origin}${currentTabURL.pathname}`;

    const tabUrlChanged = originalTabHostPath !== currentTabHostPath;

    if (this.pageDetails == null || this.pageDetails.length === 0 || tabUrlChanged) {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("autofillError"),
      });
      return false;
    }

    try {
      this.totpCode = await this.autofillService.doAutoFill({
        tab: this.tab,
        cipher: this.cipher,
        pageDetails: this.pageDetails,
        doc: window.document,
        fillNewPassword: true,
        allowTotpAutofill: true,
      });
      if (this.totpCode != null) {
        this.platformUtilsService.copyToClipboard(this.totpCode, { window: window });
      }
    } catch {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("autofillError"),
      });
      this.changeDetectorRef.detectChanges();
      return false;
    }

    return true;
  }

  async fillCipher() {
    const didAutofill = await this.doAutofill();
    if (didAutofill) {
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("autoFillSuccess"),
      });
    }

    return didAutofill;
  }

  async fillCipherAndSave() {
    const didAutofill = await this.doAutofill();

    if (didAutofill) {
      if (this.tab == null) {
        throw new Error("No tab found.");
      }

      if (this.cipher.login.uris == null) {
        this.cipher.login.uris = [];
      } else {
        if (this.cipher.login.uris.some((uri) => uri.uri === this.tab.url)) {
          this.toastService.showToast({
            variant: "success",
            title: null,
            message: this.i18nService.t("autoFillSuccessAndSavedUri"),
          });
          return;
        }
      }

      const loginUri = new LoginUriView();
      loginUri.uri = this.tab.url;
      this.cipher.login.uris.push(loginUri);

      try {
        const cipher: Cipher = await this.cipherService.encrypt(this.cipher);
        await this.cipherService.updateWithServer(cipher);

        this.toastService.showToast({
          variant: "success",
          title: null,
          message: this.i18nService.t("autoFillSuccessAndSavedUri"),
        });
        this.messagingService.send("editedCipher");
      } catch {
        this.toastService.showToast({
          variant: "error",
          title: null,
          message: this.i18nService.t("unexpectedError"),
        });
      }
    }
  }
}

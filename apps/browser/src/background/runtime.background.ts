import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { NotificationsService } from "@bitwarden/common/abstractions/notifications.service";
import { SystemService } from "@bitwarden/common/abstractions/system.service";
import { Utils } from "@bitwarden/common/misc/utils";

import { AutofillService } from "../autofill/services/abstractions/autofill.service";
import { BrowserApi } from "../browser/browserApi";
import { BrowserEnvironmentService } from "../services/browser-environment.service";
import BrowserPlatformUtilsService from "../services/browserPlatformUtils.service";

import MainBackground from "./main.background";
import LockedVaultPendingNotificationsItem from "./models/lockedVaultPendingNotificationsItem";

export default class RuntimeBackground {
  private autofillTimeout: any;
  private pageDetailsToAutoFill: any[] = [];
  private onInstalledReason: string = null;
  private lockedVaultPendingNotifications: LockedVaultPendingNotificationsItem[] = [];
  private abortControllers = new Map<string, AbortController>();

  constructor(
    private main: MainBackground,
    private autofillService: AutofillService,
    private platformUtilsService: BrowserPlatformUtilsService,
    private i18nService: I18nService,
    private notificationsService: NotificationsService,
    private systemService: SystemService,
    private environmentService: BrowserEnvironmentService,
    private messagingService: MessagingService,
    private logService: LogService
  ) {
    // onInstalled listener must be wired up before anything else, so we do it in the ctor
    chrome.runtime.onInstalled.addListener((details: any) => {
      this.onInstalledReason = details.reason;
    });
  }

  async init() {
    if (!chrome.runtime) {
      return;
    }

    await this.checkOnInstalled();
    const backgroundMessageListener = (
      msg: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: any
    ) => {
      const messagesWithResponse = ["fido2RegisterCredentialRequest", "fido2GetCredentialRequest"];

      if (messagesWithResponse.includes(msg.command)) {
        this.processMessage(msg, sender).then(
          (value) => sendResponse({ result: value }),
          (error) => sendResponse({ error: { ...error, message: error.message } })
        );
        return true;
      }

      this.processMessage(msg, sender);
      return false;
    };

    BrowserApi.messageListener("runtime.background", (msg, sender, sendResponse) => {
      return backgroundMessageListener(msg, sender, sendResponse);
    });
    if (this.main.popupOnlyContext) {
      (window as any).bitwardenBackgroundMessageListener = backgroundMessageListener;
    }
  }

  async processMessage(msg: any, sender: any): Promise<unknown> {
    switch (msg.command) {
      case "loggedIn":
      case "unlocked": {
        let item: LockedVaultPendingNotificationsItem;

        if (this.lockedVaultPendingNotifications?.length > 0) {
          await BrowserApi.closeLoginTab();

          item = this.lockedVaultPendingNotifications.pop();
          if (item.commandToRetry.sender?.tab?.id) {
            await BrowserApi.focusSpecifiedTab(item.commandToRetry.sender.tab.id);
          }
        }

        await this.main.refreshBadge();
        await this.main.refreshMenu(false);
        this.notificationsService.updateConnection(msg.command === "unlocked");
        this.systemService.cancelProcessReload();

        if (item) {
          await BrowserApi.tabSendMessageData(
            item.commandToRetry.sender.tab,
            "unlockCompleted",
            item
          );
        }
        break;
      }
      case "addToLockedVaultPendingNotifications":
        this.lockedVaultPendingNotifications.push(msg.data);
        break;
      case "logout":
        await this.main.logout(msg.expired, msg.userId);
        break;
      case "syncCompleted":
        if (msg.successfully) {
          setTimeout(async () => {
            await this.main.refreshBadge();
            await this.main.refreshMenu();
          }, 2000);
          this.main.avatarUpdateService.loadColorFromState();
        }
        break;
      case "openPopup":
        await this.main.openPopup();
        break;
      case "promptForLogin":
        await BrowserApi.createNewTab("popup/index.html?uilocation=popout", true, true);
        break;
      case "showDialogResolve":
        this.platformUtilsService.resolveDialogPromise(msg.dialogId, msg.confirmed);
        break;
      case "bgCollectPageDetails":
        await this.main.collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
        break;
      case "bgUpdateContextMenu":
      case "editedCipher":
      case "addedCipher":
      case "deletedCipher":
        await this.main.refreshBadge();
        await this.main.refreshMenu();
        break;
      case "bgReseedStorage":
        await this.main.reseedStorage();
        break;
      case "collectPageDetailsResponse":
        switch (msg.sender) {
          case "autofiller":
          case "autofill_cmd": {
            const totpCode = await this.autofillService.doAutoFillActiveTab(
              [
                {
                  frameId: sender.frameId,
                  tab: msg.tab,
                  details: msg.details,
                },
              ],
              msg.sender === "autofill_cmd"
            );
            if (totpCode != null) {
              this.platformUtilsService.copyToClipboard(totpCode, { window: window });
            }
            break;
          }
          case "contextMenu":
            clearTimeout(this.autofillTimeout);
            this.pageDetailsToAutoFill.push({
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details,
            });
            this.autofillTimeout = setTimeout(async () => await this.autofillPage(msg.tab), 300);
            break;
          default:
            break;
        }
        break;
      case "authResult": {
        const vaultUrl = this.environmentService.getWebVaultUrl();

        if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
          return;
        }

        try {
          BrowserApi.createNewTab(
            "popup/index.html?uilocation=popout#/sso?code=" +
              encodeURIComponent(msg.code) +
              "&state=" +
              encodeURIComponent(msg.state)
          );
        } catch {
          this.logService.error("Unable to open sso popout tab");
        }
        break;
      }
      case "webAuthnResult": {
        const vaultUrl = this.environmentService.getWebVaultUrl();

        if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
          return;
        }

        const params =
          `webAuthnResponse=${encodeURIComponent(msg.data)};` +
          `remember=${encodeURIComponent(msg.remember)}`;
        BrowserApi.createNewTab(
          `popup/index.html?uilocation=popout#/2fa;${params}`,
          undefined,
          false
        );
        break;
      }
      case "reloadPopup":
        this.messagingService.send("reloadPopup");
        break;
      case "emailVerificationRequired":
        this.messagingService.send("showDialog", {
          dialogId: "emailVerificationRequired",
          title: this.i18nService.t("emailVerificationRequired"),
          text: this.i18nService.t("emailVerificationRequiredDesc"),
          confirmText: this.i18nService.t("ok"),
          type: "info",
        });
        break;
      case "getClickedElementResponse":
        this.platformUtilsService.copyToClipboard(msg.identifier, { window: window });
        break;
      case "fido2AbortRequest":
        this.abortControllers.get(msg.abortedRequestId)?.abort();
        break;
      case "fido2RegisterCredentialRequest":
        return await this.main.fido2ClientService
          .createCredential(msg.data, this.createAbortController(msg.requestId))
          .finally(() => this.abortControllers.delete(msg.requestId));
      case "fido2GetCredentialRequest":
        return await this.main.fido2ClientService
          .assertCredential(msg.data, this.createAbortController(msg.requestId))
          .finally(() => this.abortControllers.delete(msg.requestId));
    }
    return undefined;
  }

  private async autofillPage(tabToAutoFill: chrome.tabs.Tab) {
    const totpCode = await this.autofillService.doAutoFill({
      tab: tabToAutoFill,
      cipher: this.main.loginToAutoFill,
      pageDetails: this.pageDetailsToAutoFill,
      fillNewPassword: true,
    });

    if (totpCode != null) {
      this.platformUtilsService.copyToClipboard(totpCode, { window: window });
    }

    // reset
    this.main.loginToAutoFill = null;
    this.pageDetailsToAutoFill = [];
  }

  private async checkOnInstalled() {
    setTimeout(async () => {
      if (this.onInstalledReason != null) {
        if (this.onInstalledReason === "install") {
          BrowserApi.createNewTab("https://bitwarden.com/browser-start/");

          if (await this.environmentService.hasManagedEnvironment()) {
            await this.environmentService.setUrlsToManagedEnvironment();
          }
        }

        this.onInstalledReason = null;
      }
    }, 100);
  }

  private createAbortController(id: string): AbortController {
    const abortController = new AbortController();
    this.abortControllers.set(id, abortController);
    return abortController;
  }
}

import {ChangeDetectorRef, Component, EventEmitter, NgZone, OnChanges, Output,} from "@angular/core";

import {ViewComponent as BaseViewComponent} from "@bitwarden/angular/vault/components/view.component";
import {ApiService} from "@bitwarden/common/abstractions/api.service";
import {AuditService} from "@bitwarden/common/abstractions/audit.service";
import {EventCollectionService} from "@bitwarden/common/abstractions/event/event-collection.service";
import {TokenService} from "@bitwarden/common/auth/abstractions/token.service";
import {BroadcasterService} from "@bitwarden/common/platform/abstractions/broadcaster.service";
import {CryptoService} from "@bitwarden/common/platform/abstractions/crypto.service";
import {FileDownloadService} from "@bitwarden/common/platform/abstractions/file-download/file-download.service";
import {I18nService} from "@bitwarden/common/platform/abstractions/i18n.service";
import {LogService} from "@bitwarden/common/platform/abstractions/log.service";
import {MessagingService} from "@bitwarden/common/platform/abstractions/messaging.service";
import {PlatformUtilsService} from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {StateService} from "@bitwarden/common/platform/abstractions/state.service";
import {CipherService} from "@bitwarden/common/vault/abstractions/cipher.service";
import {FolderService} from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";import { TotpService } from "@bitwarden/common/vault/abstractions/totp.service";
import {CipherView} from "@bitwarden/common/vault/models/view/cipher.view";
import {DialogService} from "@bitwarden/components";
import {PasswordRepromptService} from "@bitwarden/vault";
import {code128} from 'bwip-js';

const BroadcasterSubscriptionId = "ViewComponent";

@Component({
  selector: "app-vault-view",
  templateUrl: "view.component.html",
})
export class ViewComponent extends BaseViewComponent implements OnChanges {
  @Output() onViewCipherPasswordHistory = new EventEmitter<CipherView>();
  unicodeToWindows1252Mapping: Record<number, number> = {
    8364: 128, 129: 129, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
    710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 141: 141, 381: 142, 143: 143,
    144: 144, 8216: 145, 8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151,
    732: 152, 8482: 153, 353: 154, 8250: 155, 339: 156, 157: 157, 382: 158, 376: 159,
  };

  constructor(
    cipherService: CipherService,
    folderService: FolderService,
    totpService: TotpService,
    tokenService: TokenService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    platformUtilsService: PlatformUtilsService,
    auditService: AuditService,
    broadcasterService: BroadcasterService,
    ngZone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    eventCollectionService: EventCollectionService,
    apiService: ApiService,
    private messagingService: MessagingService,
    passwordRepromptService: PasswordRepromptService,
    logService: LogService,
    stateService: StateService,
    fileDownloadService: FileDownloadService,
    dialogService: DialogService,
  ) {
    super(
      cipherService,
      folderService,
      totpService,
      tokenService,
      i18nService,
      cryptoService,
      platformUtilsService,
      auditService,
      window,
      broadcasterService,
      ngZone,
      changeDetectorRef,
      eventCollectionService,
      apiService,
      passwordRepromptService,
      logService,
      stateService,
      fileDownloadService,
      dialogService,
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(() => {
        switch (message.command) {
          case "windowHidden":
            this.onWindowHidden();
            break;
          default:
        }
      });
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async ngOnChanges() {
    await super.load();
    let text = this.cipher.login.password;
    text = this.escapeNonAscii(text);
    try {
      let canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const maxWidth = canvas.parentElement.getBoundingClientRect().width;
      const ctx = canvas.getContext('2d');
      code128(canvas, {
        bcid: 'code128',
        backgroundcolor: "FFFFFF",
        text: text,
        parse: true,
        scale: 3,
        height: 10,
      });
      const barcodeWidth = canvas.width;
      if (barcodeWidth > maxWidth) {
        const scaleFactor = maxWidth / barcodeWidth;
        canvas.width = maxWidth;
        canvas.height *= scaleFactor;
        ctx.clearRect(0, 0, maxWidth, canvas.height);
        code128(canvas, {
          bcid: 'code128',
          backgroundcolor: "FFFFFF", // Barcode type
          text: text,
          parse: true,// Text to encode
          scale: 3 * scaleFactor,
          height: 10 * scaleFactor,
        });
      }
    } catch (e) {
    }
  }

  private escapeNonAscii(input: string): string {
    return input.replace(/[^\x00-\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      return '^' + this.unicodeToWindows1252Mapping[code];
    });
  }

  viewHistory() {
    this.onViewCipherPasswordHistory.emit(this.cipher);
  }

  async copy(value: string, typeI18nKey: string, aType: string): Promise<boolean> {
    const hasCopied = await super.copy(value, typeI18nKey, aType);
    if (hasCopied) {
      this.messagingService.send("minimizeOnCopy");
    }

    return hasCopied;
  }

  onWindowHidden() {
    this.showPassword = false;
    this.showCardNumber = false;
    this.showCardCode = false;
    if (this.cipher !== null && this.cipher.hasFields) {
      this.cipher.fields.forEach((field) => {
        field.showValue = false;
      });
    }
  }

  showGetPremium() {
    if (!this.canAccessPremium) {
      this.messagingService.send("premiumRequired");
    }
  }
}

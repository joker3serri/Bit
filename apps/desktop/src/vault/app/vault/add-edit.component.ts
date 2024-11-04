import { DatePipe } from "@angular/common";
import {
  Component,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { sshagent as sshAgent } from "desktop_native/napi";
import { firstValueFrom, race } from "rxjs";

import { CollectionService } from "@bitwarden/admin-console/common";
import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AddEditComponent as BaseAddEditComponent } from "@bitwarden/angular/vault/components/add-edit.component";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SendApiService } from "@bitwarden/common/tools/send/services/send-api.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { CipherType } from "@bitwarden/common/vault/enums";
import { DialogService, ToastService } from "@bitwarden/components";
import { PasswordRepromptService } from "@bitwarden/vault";

import { SshKeyGeneratorDialogComponent } from "../../../app/tools/sshkey-generator.component";

const BroadcasterSubscriptionId = "AddEditComponent";

@Component({
  selector: "app-vault-add-edit",
  templateUrl: "add-edit.component.html",
})
export class AddEditComponent extends BaseAddEditComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild("form")
  private form: NgForm;

  @ViewChild("sshGenerator", { read: ViewContainerRef, static: true })
  sshGeneratorModalRef: ViewContainerRef;
  private modal: ModalRef = null;

  constructor(
    cipherService: CipherService,
    folderService: FolderService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    auditService: AuditService,
    accountService: AccountService,
    collectionService: CollectionService,
    messagingService: MessagingService,
    eventCollectionService: EventCollectionService,
    policyService: PolicyService,
    passwordRepromptService: PasswordRepromptService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    logService: LogService,
    organizationService: OrganizationService,
    sendApiService: SendApiService,
    dialogService: DialogService,
    datePipe: DatePipe,
    configService: ConfigService,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {
    super(
      cipherService,
      folderService,
      i18nService,
      platformUtilsService,
      auditService,
      accountService,
      collectionService,
      messagingService,
      eventCollectionService,
      policyService,
      logService,
      passwordRepromptService,
      organizationService,
      sendApiService,
      dialogService,
      window,
      datePipe,
      configService,
    );
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.load();
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      this.ngZone.run(() => {
        switch (message.command) {
          case "windowHidden":
            this.onWindowHidden();
            break;
          default:
        }
      });
    });
    // We use ngOnChanges for everything else instead.
  }

  async ngOnChanges() {
    await this.load();
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async load() {
    if (
      document.querySelectorAll("app-vault-add-edit .ng-dirty").length === 0 ||
      (this.cipher != null && this.cipherId !== this.cipher.id)
    ) {
      this.cipher = null;
    }
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    super.load();
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

  allowOwnershipOptions(): boolean {
    return (
      (!this.editMode || this.cloneMode) &&
      this.ownershipOptions &&
      (this.ownershipOptions.length > 1 || !this.allowPersonal)
    );
  }

  markPasswordAsDirty() {
    this.form.controls["Login.Password"].markAsDirty();
  }

  openHelpReprompt() {
    this.platformUtilsService.launchUri(
      "https://bitwarden.com/help/managing-items/#protect-individual-items",
    );
  }

  async generateSshKey(initial = false) {
    let sshKey: sshAgent.SshKey = null;
    if (!initial) {
      const [modal, childComponent] = await this.modalService.openViewRef(
        SshKeyGeneratorDialogComponent,
        this.sshGeneratorModalRef,
        (comp) => {},
      );
      this.modal = modal;
      const res = await firstValueFrom(race(this.modal.onClose, childComponent.generated));
      modal.close();
      if (res == null) {
        return;
      } else {
        sshKey = (await ipc.platform.sshAgent.importKey(res.credential, "")).sshKey;
      }
    } else {
      sshKey = await ipc.platform.sshAgent.generateKey("ed25519");
    }

    if (sshKey == null) {
      return;
    }

    this.cipher.sshKey.privateKey = sshKey.privateKey;
    this.cipher.sshKey.publicKey = sshKey.publicKey;
    this.cipher.sshKey.keyFingerprint = sshKey.keyFingerprint;
    this.toastService.showToast({
      variant: "success",
      title: "",
      message: this.i18nService.t("sshKeyGenerated"),
    });
  }

  async importSshKeyFromClipboard() {
    const key = await this.platformUtilsService.readFromClipboard();
    const parsedKey = await ipc.platform.sshAgent.importKey(key, "");
    if (parsedKey == null || parsedKey.status == sshAgent.SshKeyImportStatus.ParsingError) {
      this.toastService.showToast({
        variant: "error",
        title: "",
        message: this.i18nService.t("invalidSshKey"),
      });
      return;
    } else if (
      parsedKey.status == sshAgent.SshKeyImportStatus.PasswordRequired ||
      parsedKey.status == sshAgent.SshKeyImportStatus.WrongPassword
    ) {
      this.toastService.showToast({
        variant: "error",
        title: "",
        message: this.i18nService.t("sshKeyPasswordUnsupported"),
      });
      return;
    } else {
      this.cipher.sshKey.privateKey = parsedKey.sshKey.privateKey;
      this.cipher.sshKey.publicKey = parsedKey.sshKey.publicKey;
      this.cipher.sshKey.keyFingerprint = parsedKey.sshKey.keyFingerprint;
      this.toastService.showToast({
        variant: "success",
        title: "",
        message: this.i18nService.t("sshKeyPasted"),
      });
    }
  }

  async typeChange() {
    if (this.cipher.type == CipherType.SshKey) {
      await this.generateSshKey(true);
    }
  }

  truncateString(value: string, length: number) {
    return value.length > length ? value.substring(0, length) + "..." : value;
  }

  togglePrivateKey() {
    this.showPrivateKey = !this.showPrivateKey;
  }
}

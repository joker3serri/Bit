import { Directive, ViewChild, ViewContainerRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { firstValueFrom, lastValueFrom, debounceTime, combineLatest, BehaviorSubject } from "rxjs";

import { UserNamePipe } from "@bitwarden/angular/pipes/user-name.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationManagementPreferencesService } from "@bitwarden/common/admin-console/abstractions/organization-management-preferences/organization-management-preferences.service";
import {
  OrganizationUserStatusType,
  OrganizationUserType,
  ProviderUserStatusType,
  ProviderUserType,
} from "@bitwarden/common/admin-console/enums";
import { ProviderUserUserDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-user.response";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DialogService, TableDataSource, ToastService } from "@bitwarden/components";

import { OrganizationUserView } from "../organizations/core/views/organization-user.view";
import { UserConfirmComponent } from "../organizations/manage/user-confirm.component";

type StatusType = OrganizationUserStatusType | ProviderUserStatusType;
type UserViewTypes = ProviderUserUserDetailsResponse | OrganizationUserView;

const MaxCheckedCount = 500;

/**
 * Returns true if the user matches the status, or if the status is `null`, if the user is active (not revoked).
 */
function statusFilter(user: UserViewTypes, status: StatusType) {
  if (status == null) {
    return user.status != OrganizationUserStatusType.Revoked;
  }

  return user.status === status;
}

/**
 * Returns true if the string matches the user's id, name, or email.
 * (The default string search includes all properties, which can return false positives for collection names etc)
 */
function textFilter(user: UserViewTypes, text: string) {
  const normalizedText = text?.toLowerCase();
  return (
    !normalizedText || // null/empty strings should be ignored, i.e. always return true
    user.email.toLowerCase().includes(normalizedText) ||
    user.id.toLowerCase().includes(normalizedText) ||
    user.name?.toLowerCase().includes(normalizedText)
  );
}

function peopleFilter(searchText: string, status: StatusType) {
  return (user: UserViewTypes) => statusFilter(user, status) && textFilter(user, searchText);
}

/**
 * A refactored copy of BasePeopleComponent, using the component library table and other modern features.
 * This will replace BasePeopleComponent once all subclasses have been changed over to use this class.
 */
@Directive()
export abstract class NewBasePeopleComponent<UserView extends UserViewTypes> {
  @ViewChild("confirmTemplate", { read: ViewContainerRef, static: true })
  confirmModalRef: ViewContainerRef;

  /**
   * Shows a banner alerting the admin that users need to be confirmed.
   */
  get showConfirmUsers(): boolean {
    const activeCount = this.getStatusCount(null);
    const confirmedCount = this.getStatusCount(this.userStatusType.Confirmed);
    const acceptedCount = this.getStatusCount(this.userStatusType.Accepted);

    return activeCount > 1 && confirmedCount > 0 && confirmedCount < 3 && acceptedCount > 0;
  }

  get showBulkConfirmUsers(): boolean {
    return this.getStatusCount(this.userStatusType.Accepted) > 0;
  }

  abstract userType: typeof OrganizationUserType | typeof ProviderUserType;
  abstract userStatusType: typeof OrganizationUserStatusType | typeof ProviderUserStatusType;

  protected dataSource = new TableDataSource<UserView>();

  firstLoaded: boolean;

  /**
   * The currently selected status filter, or null to show all active users.
   */
  status: StatusType | null;

  /**
   * The currently executing promise - used to avoid multiple user actions executing at once.
   */
  actionPromise: Promise<void>;

  protected searchControl = new FormControl("", { nonNullable: true });
  protected statusToggle = new BehaviorSubject<StatusType | null>(null);

  constructor(
    protected apiService: ApiService,
    protected i18nService: I18nService,
    protected cryptoService: CryptoService,
    protected validationService: ValidationService,
    protected modalService: ModalService,
    private logService: LogService,
    protected userNamePipe: UserNamePipe,
    protected dialogService: DialogService,
    protected organizationManagementPreferencesService: OrganizationManagementPreferencesService,
    protected toastService: ToastService,
  ) {
    // Connect the search input and status toggles to the table dataSource filter
    combineLatest([this.searchControl.valueChanges.pipe(debounceTime(200)), this.statusToggle])
      .pipe(takeUntilDestroyed())
      .subscribe(
        ([searchText, status]) => (this.dataSource.filter = peopleFilter(searchText, status)),
      );
  }

  abstract edit(user: UserView): void;
  abstract getUsers(): Promise<ListResponse<UserView> | UserView[]>;
  abstract deleteUser(id: string): Promise<void>;
  abstract revokeUser(id: string): Promise<void>;
  abstract restoreUser(id: string): Promise<void>;
  abstract reinviteUser(id: string): Promise<void>;
  abstract confirmUser(user: UserView, publicKey: Uint8Array): Promise<void>;

  async load() {
    // Load new users from the server
    const response = await this.getUsers();

    // Not sure why this is necessary, I assume different subcomponents supply different types
    if (response instanceof ListResponse) {
      this.dataSource.data = response.data != null && response.data.length > 0 ? response.data : [];
    } else if (Array.isArray(response)) {
      this.dataSource.data = response;
    }

    this.firstLoaded = true;
  }

  getStatusCount(status: StatusType | null) {
    if (status == null) {
      return this.dataSource.data.filter((u) => u.status !== this.userStatusType.Revoked).length;
    }

    return this.dataSource.data.filter((u) => u.status === status).length;
  }

  checkUser(user: UserView, select?: boolean) {
    (user as any).checked = select == null ? !(user as any).checked : select;
  }

  selectAll(select: boolean) {
    if (select) {
      // Reset checkbox selection first so we know nothing else is selected
      this.selectAll(false);
    }

    const filteredUsers = this.dataSource.filteredData;

    const selectCount =
      select && filteredUsers.length > MaxCheckedCount ? MaxCheckedCount : filteredUsers.length;
    for (let i = 0; i < selectCount; i++) {
      this.checkUser(filteredUsers[i], select);
    }
  }

  invite() {
    this.edit(null);
  }

  protected async removeUserConfirmationDialog(user: UserView) {
    return this.dialogService.openSimpleDialog({
      title: this.userNamePipe.transform(user),
      content: { key: "removeUserConfirmation" },
      type: "warning",
    });
  }

  async remove(user: UserView) {
    const confirmed = await this.removeUserConfirmationDialog(user);
    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.deleteUser(user.id);
    try {
      await this.actionPromise;
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("removedUserId", this.userNamePipe.transform(user)),
      });
      this.removeUser(user);
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  protected async revokeUserConfirmationDialog(user: UserView) {
    return this.dialogService.openSimpleDialog({
      title: { key: "revokeAccess", placeholders: [this.userNamePipe.transform(user)] },
      content: this.revokeWarningMessage(),
      acceptButtonText: { key: "revokeAccess" },
      type: "warning",
    });
  }

  async revoke(user: UserView) {
    const confirmed = await this.revokeUserConfirmationDialog(user);

    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.revokeUser(user.id);
    try {
      await this.actionPromise;
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("revokedUserId", this.userNamePipe.transform(user)),
      });
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async restore(user: UserView) {
    this.actionPromise = this.restoreUser(user.id);
    try {
      await this.actionPromise;
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("restoredUserId", this.userNamePipe.transform(user)),
      });
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async reinvite(user: UserView) {
    if (this.actionPromise != null) {
      return;
    }

    this.actionPromise = this.reinviteUser(user.id);
    try {
      await this.actionPromise;
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("hasBeenReinvited", this.userNamePipe.transform(user)),
      });
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
  }

  async confirm(user: UserView) {
    const confirmUser = async (publicKey: Uint8Array) => {
      try {
        this.actionPromise = this.confirmUser(user, publicKey);
        await this.actionPromise;
        user.status = this.userStatusType.Confirmed;
        this.toastService.showToast({
          variant: "success",
          title: null,
          message: this.i18nService.t("hasBeenConfirmed", this.userNamePipe.transform(user)),
        });
      } catch (e) {
        this.validationService.showError(e);
        throw e;
      } finally {
        this.actionPromise = null;
      }
    };

    if (this.actionPromise != null) {
      return;
    }

    try {
      const publicKeyResponse = await this.apiService.getUserPublicKey(user.userId);
      const publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);

      const autoConfirm = await firstValueFrom(
        this.organizationManagementPreferencesService.autoConfirmFingerPrints.state$,
      );
      if (autoConfirm == null || !autoConfirm) {
        const dialogRef = UserConfirmComponent.open(this.dialogService, {
          data: {
            name: this.userNamePipe.transform(user),
            userId: user != null ? user.userId : null,
            publicKey: publicKey,
            confirmUser: () => confirmUser(publicKey),
          },
        });
        await lastValueFrom(dialogRef.closed);

        return;
      }

      try {
        const fingerprint = await this.cryptoService.getFingerprint(user.userId, publicKey);
        this.logService.info(`User's fingerprint: ${fingerprint.join("-")}`);
      } catch (e) {
        this.logService.error(e);
      }
      await confirmUser(publicKey);
    } catch (e) {
      this.logService.error(`Handled exception: ${e}`);
    }
  }

  protected revokeWarningMessage(): string {
    return this.i18nService.t("revokeUserConfirmation");
  }

  protected getCheckedUsers() {
    return this.dataSource.data.filter((u) => (u as any).checked);
  }

  /**
   * Remove a user row from the table
   */
  protected removeUser(user: UserView) {
    const index = this.dataSource.data.indexOf(user);
    if (index > -1) {
      // Clone the array so that the setter for dataSource.data is triggered to update the table rendering
      const updatedData = [...this.dataSource.data];
      updatedData.splice(index, 1);
      this.dataSource.data = updatedData;
    }
  }
}

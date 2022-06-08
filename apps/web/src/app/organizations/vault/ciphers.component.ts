import { Component, EventEmitter, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CipherService } from "@bitwarden/common/src/abstractions/cipher.service";
import { EventService } from "@bitwarden/common/src/abstractions/event.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/src/abstractions/organization.service";
import { PasswordRepromptService } from "@bitwarden/common/src/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { SearchService } from "@bitwarden/common/src/abstractions/search.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { TokenService } from "@bitwarden/common/src/abstractions/token.service";
import { TotpService } from "@bitwarden/common/src/abstractions/totp.service";
import { Organization } from "@bitwarden/common/src/models/domain/organization";
import { CipherView } from "@bitwarden/common/src/models/view/cipherView";

import { CiphersComponent as BaseCiphersComponent } from "../../vault/ciphers.component";

@Component({
  selector: "app-org-vault-ciphers",
  templateUrl: "../../vault/ciphers.component.html",
})
export class CiphersComponent extends BaseCiphersComponent {
  @Output() onEventsClicked = new EventEmitter<CipherView>();

  organization: Organization;
  accessEvents = false;

  protected allCiphers: CipherView[] = [];

  constructor(
    searchService: SearchService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    cipherService: CipherService,
    eventService: EventService,
    totpService: TotpService,
    passwordRepromptService: PasswordRepromptService,
    logService: LogService,
    stateService: StateService,
    organizationService: OrganizationService,
    tokenService: TokenService,
    private apiService: ApiService
  ) {
    super(
      searchService,
      i18nService,
      platformUtilsService,
      cipherService,
      eventService,
      totpService,
      stateService,
      passwordRepromptService,
      logService,
      organizationService,
      tokenService
    );
  }

  async load(filter: (cipher: CipherView) => boolean = null, deleted = false) {
    this.deleted = deleted || false;
    if (this.organization.canEditAnyCollection) {
      this.accessEvents = this.organization.useEvents;
      this.allCiphers = await this.cipherService.getAllFromApiForOrganization(this.organization.id);
    } else {
      this.allCiphers = (await this.cipherService.getAllDecrypted()).filter(
        (c) => c.organizationId === this.organization.id
      );
    }
    await this.searchService.indexCiphers(this.organization.id, this.allCiphers);
    await this.applyFilter(filter);
    this.loaded = true;
  }

  async applyFilter(filter: (cipher: CipherView) => boolean = null) {
    if (this.organization.canViewAllCollections) {
      await super.applyFilter(filter);
    } else {
      const f = (c: CipherView) =>
        c.organizationId === this.organization.id && (filter == null || filter(c));
      await super.applyFilter(f);
    }
  }

  async search(timeout: number = null) {
    await super.search(timeout, this.allCiphers);
  }
  events(c: CipherView) {
    this.onEventsClicked.emit(c);
  }

  protected deleteCipher(id: string) {
    if (!this.organization.canEditAnyCollection) {
      return super.deleteCipher(id, this.deleted);
    }
    return this.deleted
      ? this.apiService.deleteCipherAdmin(id)
      : this.apiService.putDeleteCipherAdmin(id);
  }

  protected showFixOldAttachments(c: CipherView) {
    return this.organization.canEditAnyCollection && c.hasOldAttachments;
  }
}

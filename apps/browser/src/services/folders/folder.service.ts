import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Folder } from "@bitwarden/common/models/domain/folder";
import { FolderView } from "@bitwarden/common/models/view/folderView";
import { FolderService as BaseFolderService } from "@bitwarden/common/services/folder/folder.service";

import { browserSession, sessionSync } from "../../decorators/session-sync-observable";

@browserSession
export class FolderService extends BaseFolderService {
  @sessionSync({ initializer: Folder.fromJSON, initializeAsArray: true })
  protected _folders: BehaviorSubject<Folder[]>;
  @sessionSync({ initializer: FolderView.fromJSON, initializeAsArray: true })
  protected _folderViews: BehaviorSubject<FolderView[]>;

  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    cipherService: CipherService,
    stateService: StateService
  ) {
    super(cryptoService, i18nService, cipherService, stateService);
  }
}

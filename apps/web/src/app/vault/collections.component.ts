import { Component, OnDestroy } from "@angular/core";

import { CollectionsComponent as BaseCollectionsComponent } from "@bitwarden/angular/src/components/collections.component";
import { CipherService } from "@bitwarden/common/src/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/src/abstractions/collection.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { CollectionView } from "@bitwarden/common/src/models/view/collectionView";

@Component({
  selector: "app-vault-collections",
  templateUrl: "collections.component.html",
})
export class CollectionsComponent extends BaseCollectionsComponent implements OnDestroy {
  constructor(
    collectionService: CollectionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    cipherService: CipherService,
    logService: LogService
  ) {
    super(collectionService, platformUtilsService, i18nService, cipherService, logService);
  }

  ngOnDestroy() {
    this.selectAll(false);
  }

  check(c: CollectionView, select?: boolean) {
    (c as any).checked = select == null ? !(c as any).checked : select;
  }

  selectAll(select: boolean) {
    this.collections.forEach((c) => this.check(c, select));
  }
}

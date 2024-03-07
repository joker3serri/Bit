import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

import { ImportCollectionServiceAbstraction } from "../../../../../../libs/importer/src/services/import-collection.service.abstraction";
import { CollectionAdminService } from "../../vault/core/collection-admin.service";

export class ImportCollectionAdminService implements ImportCollectionServiceAbstraction {
  constructor(private collectionAdminService: CollectionAdminService) {}

  async getAllCollections(organizationId: string): Promise<CollectionView[]> {
    return await this.collectionAdminService.getAll(organizationId);
  }
}

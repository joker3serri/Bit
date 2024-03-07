import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

import { ImportCollectionServiceAbstraction } from "./import-collection.service.abstraction";

export class ImportCollectionService implements ImportCollectionServiceAbstraction {
  constructor(private collectionService: CollectionService) {}

  async getAllCollections(): Promise<CollectionView[]> {
    return await this.collectionService.getAllDecrypted();
  }
}

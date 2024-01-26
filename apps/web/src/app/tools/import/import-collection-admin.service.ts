import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { CollectionData } from "@bitwarden/common/vault/models/data/collection.data";
import { Collection } from "@bitwarden/common/vault/models/domain/collection";
import { CollectionDetailsResponse } from "@bitwarden/common/vault/models/response/collection.response";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

import { ImportCollectionServiceAbstraction } from "../../../../../../libs/importer/src/services/import-collection.service.abstraction";

@Injectable()
export class ImportCollectionAdminService implements ImportCollectionServiceAbstraction {
  constructor(
    private collectionService: CollectionService,
    private apiService: ApiService,
  ) {}

  async getAllAdminCollections(organizationId: string): Promise<CollectionView[]> {
    const response = await this.apiService.getCollections(organizationId);
    const collections = response.data
      .filter((c) => c.organizationId === organizationId)
      .map((r) => new Collection(new CollectionData(r as CollectionDetailsResponse)));
    return await this.collectionService.decryptMany(collections);
  }
}

import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";

export abstract class ImportCollectionServiceAbstraction {
  getAllCollections: (organizationId?: string) => Promise<CollectionView[]>;
}

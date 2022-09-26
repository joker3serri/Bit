import { CollectionRequest } from "@bitwarden/common/models/request/collection.request";
import { CollectionResponse } from "@bitwarden/common/models/response/collection.response";
import { CollectionAdminView } from "@bitwarden/common/models/view/collection-admin-view";

export class CollectionAdminService {
  getAll: (organizationId: string) => Promise<CollectionAdminView[]>;
  decryptMany: (
    organizationId: string,
    collections: CollectionResponse[]
  ) => Promise<CollectionAdminView[]>;
  encrypt: (model: CollectionAdminView) => Promise<CollectionRequest>;
  save: (collection: CollectionAdminView) => Promise<unknown>;
}

import { Collection } from "../../admin-console/models/domain/collection";
import { SelectionReadOnlyRequest } from "../../admin-console/models/request/selection-read-only.request";

export class CollectionRequest {
  name: string;
  externalId: string;
  groups: SelectionReadOnlyRequest[] = [];
  users: SelectionReadOnlyRequest[] = [];

  constructor(collection?: Collection) {
    if (collection == null) {
      return;
    }
    this.name = collection.name ? collection.name.encryptedString : null;
    this.externalId = collection.externalId;
  }
}

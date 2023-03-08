import { CollectionView } from "@bitwarden/common/models/view/collection.view";

import { CollectionResponse } from "./collection.response";
import { SelectionReadOnly } from "../selection-read-only";

export class OrganizationCollectionResponse extends CollectionResponse {
  groups: SelectionReadOnly[];

  constructor(o: CollectionView, groups: SelectionReadOnly[]) {
    super(o);
    this.object = "org-collection";
    this.groups = groups;
  }
}

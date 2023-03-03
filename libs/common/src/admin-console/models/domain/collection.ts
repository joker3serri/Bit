import Domain from "../../../models/domain/domain-base";
import { EncString } from "../../../models/domain/enc-string";
import { CollectionView } from "../../../models/view/collection.view";
import { CollectionData } from "../data/collection.data";

export class Collection extends Domain {
  id: string;
  organizationId: string;
  name: EncString;
  externalId: string;
  readOnly: boolean;
  hidePasswords: boolean;

  constructor(obj?: CollectionData) {
    super();
    if (obj == null) {
      return;
    }

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        organizationId: null,
        name: null,
        externalId: null,
        readOnly: null,
        hidePasswords: null,
      },
      ["id", "organizationId", "externalId", "readOnly", "hidePasswords"]
    );
  }

  decrypt(): Promise<CollectionView> {
    return this.decryptObj(
      new CollectionView(this),
      {
        name: null,
      },
      this.organizationId
    );
  }
}

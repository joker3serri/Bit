import { Jsonify } from "type-fest";

import Domain from "../../../models/domain/domain-base";
import { EncString } from "../../../models/domain/enc-string";
import { FolderView } from "../../../models/view/folder.view";
import { FolderData } from "../data/folder.data";

export class Folder extends Domain {
  id: string;
  name: EncString;
  revisionDate: Date;

  constructor(obj?: FolderData) {
    super();
    if (obj == null) {
      return;
    }

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        name: null,
      },
      ["id"]
    );

    this.revisionDate = obj.revisionDate != null ? new Date(obj.revisionDate) : null;
  }

  decrypt(): Promise<FolderView> {
    return this.decryptObj(
      new FolderView(this),
      {
        name: null,
      },
      null
    );
  }

  static fromJSON(obj: Jsonify<Folder>) {
    const revisionDate = obj.revisionDate == null ? null : new Date(obj.revisionDate);
    return Object.assign(new Folder(), obj, { name: EncString.fromJSON(obj.name), revisionDate });
  }
}

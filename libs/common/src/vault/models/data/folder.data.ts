import { FolderResponse } from "../response/folder.response";
import { Jsonify } from "type-fest";

export class FolderData {
  id: string;
  name: string;
  revisionDate: string;

  constructor(response: Partial<FolderResponse>) {
    this.name = response?.name;
    this.id = response?.id;
    this.revisionDate = response?.revisionDate;
  }

  static fromJSON(obj: Jsonify<FolderData>) {
    return Object.assign(new FolderData({}), obj);
  }
}

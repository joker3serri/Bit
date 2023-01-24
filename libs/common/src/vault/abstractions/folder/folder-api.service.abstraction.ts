import { FolderResponse } from "../../../models/response/folder.response";
import { Folder } from "../../models/domain/folder";

export class FolderApiServiceAbstraction {
  save: (folder: Folder) => Promise<any>;
  delete: (id: string) => Promise<any>;
  get: (id: string) => Promise<FolderResponse>;
}

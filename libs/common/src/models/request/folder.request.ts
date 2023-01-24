import { Folder } from "../../vault/models/domain/folder";

export class FolderRequest {
  name: string;

  constructor(folder: Folder) {
    this.name = folder.name ? folder.name.encryptedString : null;
  }
}

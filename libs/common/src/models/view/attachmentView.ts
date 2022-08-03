import { Jsonify } from "type-fest";

import { Attachment } from "../domain/attachment";
import { SymmetricCryptoKey } from "../domain/symmetricCryptoKey";

import { View } from "./view";

export class AttachmentView implements View {
  id: string = null;
  url: string = null;
  size: string = null;
  sizeName: string = null;
  fileName: string = null;
  key: SymmetricCryptoKey = null;

  constructor(a?: Attachment) {
    if (!a) {
      return;
    }

    this.id = a.id;
    this.url = a.url;
    this.size = a.size;
    this.sizeName = a.sizeName;
  }

  get fileSize(): number {
    try {
      if (this.size != null) {
        return parseInt(this.size, null);
      }
    } catch {
      // Invalid file size.
    }
    return 0;
  }

  toJSON() {
    // Need to exclude readonly properties (getter)
    return {
      id: this.id,
      url: this.url,
      size: this.size,
      sizeName: this.sizeName,
      fileName: this.fileName,
      key: this.key?.toJSON(),
    };
  }

  static fromJSON(obj: Jsonify<AttachmentView>): AttachmentView {
    const key = obj.key == null ? null : SymmetricCryptoKey.fromJSON(obj.key);
    return Object.assign(new AttachmentView(), obj, { key: key });
  }
}

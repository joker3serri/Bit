import { ParsedObject, Storable, StoredObject } from "@bitwarden/common/models/storable";

import { Attachment } from "../domain/attachment";
import { SymmetricCryptoKey } from "../domain/symmetricCryptoKey";

import { View } from "./view";

export class AttachmentView extends Storable<AttachmentView> implements View {
  id: string = null;
  url: string = null;
  size: string = null;
  sizeName: string = null;
  fileName: string = null;
  key: SymmetricCryptoKey = null;

  constructor(a?: Attachment) {
    super();

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

  toJSON(): StoredObject<AttachmentView> {
    return this;
  }

  static fromJSON(obj: ParsedObject<AttachmentView>): AttachmentView {
    const view = new AttachmentView();
    view.id = obj.id;
    view.url = obj.url;
    view.size = obj.size;
    view.sizeName = obj.sizeName;
    view.fileName = obj.fileName;

    view.key = obj.key == null ? null : SymmetricCryptoKey.fromJSON(obj.key);

    return view;
  }
}

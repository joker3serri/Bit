import { SecureNoteType } from "../../enums/secureNoteType";
import { ParsedObject, ToJsonObject } from "../../models/storable";
import { SecureNote } from "../domain/secureNote";

import { ItemView } from "./itemView";

export class SecureNoteView extends ItemView<SecureNoteView> {
  type: SecureNoteType = null;

  constructor(n?: SecureNote) {
    super();
    if (!n) {
      return;
    }

    this.type = n.type;
  }

  get subTitle(): string {
    return null;
  }

  toJSON(): ToJsonObject<SecureNoteView> {
    return this;
  }

  static fromJSON(obj: ParsedObject<SecureNoteView>): SecureNoteView {
    const view = new SecureNoteView();
    view.type = obj.type;
    return view;
  }
}

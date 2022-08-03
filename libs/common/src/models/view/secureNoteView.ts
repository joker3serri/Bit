import { FromJson } from "@bitwarden/common/types/json.types";

import { SecureNoteType } from "../../enums/secureNoteType";
import { Storable } from "../../interfaces/storable";
import { SecureNote } from "../domain/secureNote";

import { ItemView } from "./itemView";

export class SecureNoteView extends ItemView implements Storable<SecureNoteView> {
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

  toJSON() {
    return this;
  }

  static fromJSON(obj: FromJson<SecureNoteView>): SecureNoteView {
    return Object.assign(new SecureNoteView(), obj);
  }
}

import { FromJson } from "@bitwarden/common/types/json.types";

import { Storable } from "../../interfaces/storable";
import { Password } from "../domain/password";

import { View } from "./view";

export class PasswordHistoryView implements View, Storable<PasswordHistoryView> {
  password: string = null;
  lastUsedDate: Date = null;

  constructor(ph?: Password) {
    if (!ph) {
      return;
    }

    this.lastUsedDate = ph.lastUsedDate;
  }

  toJSON() {
    return this;
  }

  static fromJSON(obj: FromJson<PasswordHistoryView>): PasswordHistoryView {
    const view = new PasswordHistoryView();
    view.password = obj.password;
    view.lastUsedDate = obj.lastUsedDate == null ? null : new Date(obj.lastUsedDate);

    return view;
  }
}

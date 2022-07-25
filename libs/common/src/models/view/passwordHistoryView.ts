import { ParsedObject, Storable, ToJsonObject } from "../../interfaces/storable";
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

  toJSON(): ToJsonObject<PasswordHistoryView> {
    return this;
  }

  static fromJSON(obj: ParsedObject<PasswordHistoryView>): PasswordHistoryView {
    const view = new PasswordHistoryView();
    view.password = obj.password;
    view.lastUsedDate = obj.lastUsedDate == null ? null : new Date(obj.lastUsedDate);

    return view;
  }
}

import { ParsedObject, Storable, StringifyObject } from "@bitwarden/common/models/storable";

import { Password } from "../domain/password";

import { View } from "./view";

export class PasswordHistoryView extends Storable<PasswordHistoryView> implements View {
  password: string = null;
  lastUsedDate: Date = null;

  constructor(ph?: Password) {
    super();

    if (!ph) {
      return;
    }

    this.lastUsedDate = ph.lastUsedDate;
  }

  toJSON(): StringifyObject<PasswordHistoryView> {
    return this;
  }

  static fromJSON(obj: ParsedObject<PasswordHistoryView>): PasswordHistoryView {
    const view = new PasswordHistoryView();
    view.password = obj.password;
    view.lastUsedDate = obj.lastUsedDate == null ? null : new Date(obj.lastUsedDate);

    return view;
  }
}

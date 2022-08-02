import { FromJson } from "@bitwarden/common/types/json.types";

import { FieldType } from "../../enums/fieldType";
import { LinkedIdType } from "../../enums/linkedIdType";
import { Storable } from "../../interfaces/storable";
import { Field } from "../domain/field";

import { View } from "./view";

export class FieldView implements View, Storable<FieldView> {
  name: string = null;
  value: string = null;
  type: FieldType = null;
  newField = false; // Marks if the field is new and hasn't been saved
  showValue = false;
  showCount = false;
  linkedId: LinkedIdType = null;

  constructor(f?: Field) {
    if (!f) {
      return;
    }

    this.type = f.type;
    this.linkedId = f.linkedId;
  }

  get maskedValue(): string {
    return this.value != null ? "••••••••" : null;
  }

  toJSON() {
    return this;
  }

  static fromJSON(obj: FromJson<FieldView>): FieldView {
    const view = new FieldView();
    view.name = obj.name;
    view.value = obj.value;
    view.type = obj.type;
    view.newField = obj.newField;
    view.showValue = obj.showValue;
    view.showCount = obj.showCount;
    view.linkedId = obj.linkedId;

    return view;
  }
}

import { ParsedObject, Storable, ToJsonObject } from "@bitwarden/common/models/storable";

import { FieldType } from "../../enums/fieldType";
import { LinkedIdType } from "../../enums/linkedIdType";
import { Field } from "../domain/field";

import { View } from "./view";

export class FieldView extends Storable<FieldView> implements View {
  name: string = null;
  value: string = null;
  type: FieldType = null;
  newField = false; // Marks if the field is new and hasn't been saved
  showValue = false;
  showCount = false;
  linkedId: LinkedIdType = null;

  constructor(f?: Field) {
    super();

    if (!f) {
      return;
    }

    this.type = f.type;
    this.linkedId = f.linkedId;
  }

  get maskedValue(): string {
    return this.value != null ? "••••••••" : null;
  }

  toJSON(): ToJsonObject<FieldView> {
    return this;
  }

  static fromJSON(obj: ParsedObject<FieldView>): FieldView {
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

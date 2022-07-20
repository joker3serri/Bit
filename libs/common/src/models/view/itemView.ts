import { LinkedMetadata } from "../../misc/linkedFieldOption.decorator";
import { Storable } from "../storable";

import { View } from "./view";

export abstract class ItemView<T extends object> extends Storable<T> implements View {
  linkedFieldOptions: Map<number, LinkedMetadata>;
  abstract get subTitle(): string;
}

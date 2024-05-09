import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import { CommonModule } from "@angular/common";
import { Component, Input, QueryList, ContentChildren } from "@angular/core";

import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";
import { MenuItemDirective, MenuModule } from "../menu";

@Component({
  selector: "bit-chip",
  templateUrl: "chip-select.component.html",
  standalone: true,
  imports: [CommonModule, ButtonModule, IconButtonModule, MenuModule],
})
export class ChipSelectComponent {
  @Input()
  get selected() {
    return this._selected;
  }
  set selected(value: BooleanInput) {
    this._selected = coerceBooleanProperty(value);
  }

  @ContentChildren(MenuItemDirective, { descendants: true })
  menuItems: QueryList<MenuItemDirective>;

  private _selected = false;

  clear(e: Event) {
    //eslint-disable-next-line
    console.log("hi");
    e.stopPropagation();
  }
}

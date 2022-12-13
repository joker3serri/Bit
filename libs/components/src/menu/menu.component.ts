import { FocusKeyManager } from "@angular/cdk/a11y";
import {
  Component,
  Output,
  TemplateRef,
  ViewChild,
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Input,
} from "@angular/core";

import { MenuItemDirective } from "./menu-item.directive";

@Component({
  selector: "bit-menu",
  templateUrl: "./menu.component.html",
  exportAs: "menuComponent",
})
export class MenuComponent implements AfterContentInit {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() closed = new EventEmitter<void>();
  @ContentChildren(MenuItemDirective, { descendants: true })
  menuItems: QueryList<MenuItemDirective>;
  keyManager?: FocusKeyManager<MenuItemDirective>;

  @Input() focusStrategy: "arrows" | "tab" = "arrows";

  ngAfterContentInit() {
    if (this.focusStrategy === "arrows") {
      this.keyManager = new FocusKeyManager(this.menuItems).withWrap();
    }
  }
}

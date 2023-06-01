import { FocusKeyManager } from "@angular/cdk/a11y";
import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
} from "@angular/core";

import { MenuItemComponent } from "./menu-item.component";

@Component({
  selector: "bit-menu",
  templateUrl: "./menu.component.html",
  exportAs: "menuComponent",
})
export class MenuComponent implements AfterContentInit {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
  @Output() closed = new EventEmitter<void>();
  @ContentChildren(MenuItemComponent, { descendants: true })
  menuItems: QueryList<MenuItemComponent>;
  keyManager?: FocusKeyManager<MenuItemComponent>;

  @Input() ariaRole: "menu" | "dialog" = "menu";

  @Input() ariaLabel: string;

  ngAfterContentInit() {
    if (this.ariaRole === "menu") {
      this.keyManager = new FocusKeyManager(this.menuItems).withWrap();
    }
  }
}

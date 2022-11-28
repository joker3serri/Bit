import { AfterContentInit, Component, ContentChildren, QueryList } from "@angular/core";

import { NavBaseComponent } from "./nav-base.component";
import { NavItemComponent } from "./nav-item.component";

@Component({
  selector: "nav-group",
  templateUrl: "./nav-group.component.html",
})
export class NavGroupComponent extends NavBaseComponent implements AfterContentInit {
  @ContentChildren(NavGroupComponent, {
    descendants: true,
  })
  nestedGroups!: QueryList<NavGroupComponent>;

  @ContentChildren(NavItemComponent, {
    descendants: true,
  })
  nestedItems!: QueryList<NavItemComponent>;

  /**
   * Is `true` if the expanded content is visible
   */
  protected open = false;

  /**
   * UID for `[attr.aria-controls]`
   */
  protected contentId = Math.random().toString(36).substring(2);

  toggle(event?: MouseEvent) {
    event?.stopPropagation();
    this.open = !this.open;
  }

  /**
   * - For any nested NavGroupComponents or NavItemComponents, increment the `treeDepth` by 1.
   */
  private initNestedStyles() {
    if (this.variant !== "tree") {
      return;
    }
    [...this.nestedGroups, ...this.nestedItems].forEach((navGroupOrItem) => {
      navGroupOrItem.treeDepth += 1;
    });
  }

  ngAfterContentInit(): void {
    this.initNestedStyles();
  }
}

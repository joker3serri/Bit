import { Component } from "@angular/core";

import { Icons } from "..";

@Component({
  selector: "bit-no-items",
  templateUrl: "./no-items.component.html",
})
export class NoItemsComponent {
  protected icon = Icons.Search;
}

import { Component } from "@angular/core";

import { BIT_TAB_GROUP } from "./tab.component";

@Component({
  selector: "bit-tab-group",
  templateUrl: "./tab-group.component.html",
  providers: [{ provide: BIT_TAB_GROUP, useExisting: TabGroupComponent }],
})
export class TabGroupComponent {}

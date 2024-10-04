import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { TableDataSource, TabsModule } from "@bitwarden/components";

import { HeaderModule } from "../../../layouts/header/header.module";

export enum AccessIntelligenceTabType {
  AllApps = 0,
  PriorityApps = 1,
  NotifiedMembers = 2,
}

@Component({
  templateUrl: "./access-intelligence.component.html",
  imports: [CommonModule, JslibModule, HeaderModule, TabsModule],
})
export class AccessIntelligenceComponent {
  tabIndex: AccessIntelligenceTabType;
  protected allApps = new TableDataSource<any>([]);
  protected priorityApps = new TableDataSource<any>([]);

  constructor(route: ActivatedRoute) {
    route.queryParams.pipe(takeUntilDestroyed(), first()).subscribe(({ tabIndex }) => {
      this.tabIndex = !isNaN(tabIndex) ? tabIndex : AccessIntelligenceTabType.AllApps;
    });
  }
}

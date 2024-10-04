import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AccessIntelligenceComponent } from "./access-intelligence.component";

const routes: Routes = [
  {
    path: "",
    component: AccessIntelligenceComponent,
    // TODO - Implement canAccessAccessIntelligenceTab
    data: {
      titleId: "accessIntelligence",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessIntelligenceRoutingModule {}

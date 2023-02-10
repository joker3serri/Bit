import { NgModule } from "@angular/core";

import { ProjectsModule } from "../projects/projects.module";
import { SecretsModule } from "../secrets/secrets.module";
import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { OverviewRoutingModule } from "./overview-routing.module";
import { OverviewComponent } from "./overview.component";

@NgModule({
  imports: [SecretsManagerSharedModule, OverviewRoutingModule, ProjectsModule, SecretsModule],
  declarations: [OverviewComponent],
  providers: [],
})
export class OverviewModule {}

import { NgModule } from "@angular/core";

import { SecretsSharedModule } from "../shared/sm-shared.module";

import { ProjectDeleteDialogComponent } from "./dialog/project-delete-dialog.component";
import { ProjectDialogComponent } from "./dialog/project-dialog.component";
import { ProjectsListComponent } from "./projects-list.component";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { ProjectsComponent } from "./projects.component";

@NgModule({
  imports: [SecretsSharedModule, ProjectsRoutingModule],
  declarations: [
    ProjectsComponent,
    ProjectsListComponent,
    ProjectDialogComponent,
    ProjectDeleteDialogComponent,
  ],
  providers: [],
})
export class ProjectsModule {}

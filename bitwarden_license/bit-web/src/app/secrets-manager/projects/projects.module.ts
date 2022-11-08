import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { ProjectDeleteDialogComponent } from "./dialog/project-delete-dialog.component";
import { ProjectDialogComponent } from "./dialog/project-dialog.component";
import { ProjectContentsComponent } from "./project-contents/project-contents.component";
import { ProjectSecretsComponent } from "./project-contents/project-secrets.component";
import { ProjectsListComponent } from "./projects-list/projects-list.component";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { ProjectsComponent } from "./projects/projects.component";

@NgModule({
  imports: [SecretsManagerSharedModule, ProjectsRoutingModule],
  declarations: [
    ProjectsComponent,
    ProjectsListComponent,
    ProjectDialogComponent,
    ProjectDeleteDialogComponent,
    ProjectContentsComponent,
    ProjectSecretsComponent,
  ],
  providers: [],
})
export class ProjectsModule {}

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ProjectContentsComponent } from "./project-contents/project-contents.component";
import { ProjectSecretsComponent } from "./project-contents/project-secrets.component";
import { ProjectsComponent } from "./projects/projects.component";

const routes: Routes = [
  {
    path: "",
    component: ProjectsComponent,
  },
  {
    path: ":projectId",
    component: ProjectContentsComponent,
    children: [
      {
        path: "",
        component: ProjectSecretsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}

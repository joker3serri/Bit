import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { TrashRoutingModule } from "./trash-routing.module";
import { TrashComponent } from "./trash.component";

@NgModule({
  imports: [SecretsManagerSharedModule, TrashRoutingModule],
  declarations: [TrashComponent],
  providers: [],
})
export class TrashModule {}

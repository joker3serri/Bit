import { NgModule } from "@angular/core";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { TrashApiService } from "./services/trash-api.service";
import { TrashService } from "./services/trash.service";
import { TrashRoutingModule } from "./trash-routing.module";
import { TrashComponent } from "./trash.component";

@NgModule({
  imports: [SecretsManagerSharedModule, TrashRoutingModule],
  declarations: [TrashComponent],
  providers: [TrashService, TrashApiService],
})
export class TrashModule {}

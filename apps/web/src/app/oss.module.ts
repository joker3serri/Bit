import { NgModule } from "@angular/core";

import { ProviderModule } from "./admin-console/providers/provider.module";
import { AuthModule } from "./auth";
import { LoginModule } from "./auth/login/login.module";
import { TrialInitiationModule } from "./auth/trial-initiation/trial-initiation.module";
import { LooseComponentsModule, SharedModule } from "./shared";
import { AccessComponent } from "./tools/send/access.component";
import { OrganizationBadgeModule } from "./vault/individual-vault/organization-badge/organization-badge.module";
import { VaultFilterModule } from "./vault/individual-vault/vault-filter/vault-filter.module";

@NgModule({
  imports: [
    SharedModule,
    LooseComponentsModule,
    TrialInitiationModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    LoginModule,
    AuthModule,
    AccessComponent,
    ProviderModule,
  ],
  exports: [
    SharedModule,
    LooseComponentsModule,
    TrialInitiationModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    LoginModule,
    AccessComponent,
  ],
  bootstrap: [],
})
export class OssModule {}

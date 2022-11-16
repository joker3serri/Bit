import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared";

import { LayoutComponent } from "./layout/layout.component";
import { NavGroupComponent } from "./layout/nav/nav-group.component";
import { NavItemComponent } from "./layout/nav/nav-item.component";
import { OrgSwitcherComponent } from "./layout/nav/org-switcher.component";
import { NavigationComponent } from "./layout/navigation.component";
import { SecretsManagerSharedModule } from "./shared/sm-shared.module";
import { SecretsManagerRoutingModule } from "./sm-routing.module";
import { SMGuard } from "./sm.guard";

@NgModule({
  imports: [SharedModule, SecretsManagerSharedModule, SecretsManagerRoutingModule],
  declarations: [
    LayoutComponent,
    NavigationComponent,
    NavItemComponent,
    NavGroupComponent,
    OrgSwitcherComponent,
  ],
  providers: [SMGuard],
})
export class SecretsManagerModule {}

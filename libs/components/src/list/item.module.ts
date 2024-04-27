import { NgModule } from "@angular/core";

import { ItemActionComponent } from "./item-action.component";
import { ItemContentComponent } from "./item-content.component";
import { ItemGroupComponent } from "./item-group.component";
import { ItemTextDirective } from "./item-text.directive";
import { ItemComponent } from "./item.component";

@NgModule({
  imports: [
    ItemComponent,
    ItemContentComponent,
    ItemActionComponent,
    ItemTextDirective,
    ItemGroupComponent,
  ],
  exports: [
    ItemComponent,
    ItemContentComponent,
    ItemActionComponent,
    ItemTextDirective,
    ItemGroupComponent,
  ],
})
export class ItemModule {}

import { NgModule } from "@angular/core";

import { InputModule } from "../input/input.module";
import { SharedModule } from "../shared";

import { SearchComponent } from "./search.component";

@NgModule({
  imports: [SharedModule, InputModule],
  declarations: [SearchComponent],
  exports: [SearchComponent, InputModule],
})
export class SearchModule {}

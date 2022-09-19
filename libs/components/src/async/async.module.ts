import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { BitActionDirective } from "./bit-action.directive";

@NgModule({
  imports: [SharedModule],
  declarations: [BitActionDirective],
  exports: [BitActionDirective],
})
export class AsyncModule {}

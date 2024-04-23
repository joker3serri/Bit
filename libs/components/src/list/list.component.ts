import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { A11yGridDirective } from "../a11y/a11y-grid.directive";

@Component({
  selector: "bit-list",
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class ListComponent extends A11yGridDirective {}

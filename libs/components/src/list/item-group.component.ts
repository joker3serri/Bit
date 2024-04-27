import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

import { A11yGridDirective } from "../a11y/a11y-grid.directive";

@Component({
  selector: "bit-item-group",
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemGroupComponent extends A11yGridDirective {}

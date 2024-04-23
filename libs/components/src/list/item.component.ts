import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from "@angular/core";

import { A11yRowDirective } from "../a11y/a11y-row.directive";
import { FocusableElementDirective } from "../shared/focusable-element";
import { TypographyModule } from "../typography";

import { ItemActionComponent } from "./item-action.component";

@Component({
  selector: "bit-item",
  standalone: true,
  imports: [CommonModule, TypographyModule, ItemActionComponent, FocusableElementDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "item.component.html",
  providers: [{ provide: A11yRowDirective, useExisting: ItemComponent }],
})
export class ItemComponent extends A11yRowDirective {
  @Input()
  iconStart: string | null = null;

  @Input()
  iconEnd: string | null = null;

  @Output()
  mainContentClicked: EventEmitter<MouseEvent> = new EventEmitter();

  /**
   * We have `:focus-within` and `:focus-visible` but no `:focus-visible-within`
   */
  protected focusVisibleWithin = signal(false);
  @HostListener("focusin", ["$event.target"])
  onFocusIn(target: HTMLElement) {
    this.focusVisibleWithin.set(target.matches(".fvw-target:focus-visible"));
  }
  @HostListener("focusout")
  onFocusOut() {
    this.focusVisibleWithin.set(false);
  }
}

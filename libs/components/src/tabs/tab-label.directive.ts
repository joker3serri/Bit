import { Directive, Inject, InjectionToken, Optional, TemplateRef } from "@angular/core";

export const BIT_TAB = new InjectionToken<unknown>("BIT_TAB");

/**
 * Used to identify template based tab labels (allows complex labels instead of just plaintext)
 *
 * @example
 * ```
 * <bit-tab>
 *   <ng-template bitTabLabel>
 *     <i class="bwi bwi-search"></i> Search
 *   </ng-template>
 *
 *   <p>Tab Content</p>
 * </bit-tab>
 * ```
 */
@Directive({
  selector: "[bitTabLabel]",
})
export class TabLabelDirective {
  constructor(
    public templateRef: TemplateRef<unknown>,
    @Inject(BIT_TAB) @Optional() public closestTab: any
  ) {}
}

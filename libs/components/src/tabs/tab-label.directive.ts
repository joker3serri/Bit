import { Directive, Inject, InjectionToken, Optional, TemplateRef } from "@angular/core";

export const BIT_TAB_LABEL = new InjectionToken<TabLabelDirective>("BitTabLabel");
export const BIT_TAB = new InjectionToken<any>("BIT_TAB");

@Directive({
  selector: "[bit-tab-label], [bitTabLabel]",
  providers: [{ provide: BIT_TAB_LABEL, useExisting: TabLabelDirective }],
})
export class TabLabelDirective {
  constructor(
    public templateRef: TemplateRef<unknown>,
    @Inject(BIT_TAB) @Optional() public closestTab: any
  ) {}
}

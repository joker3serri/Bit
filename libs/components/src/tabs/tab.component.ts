import { Component, ContentChild, Inject, InjectionToken, Input, Optional } from "@angular/core";

import { BIT_TAB, TabLabelDirective } from "./tab-label.directive";

export const BIT_TAB_GROUP = new InjectionToken<any>("BIT_TAB_GROUP");

@Component({
  selector: "bit-tab",
  templateUrl: "./tab.component.html",
  providers: [{ provide: BIT_TAB, useExisting: TabComponent }],
})
export class TabComponent {
  protected _templateLabel: TabLabelDirective;

  @Input() route: string;
  @Input() disabled = false;

  @Input("label") textLabel = "";

  @ContentChild(TabLabelDirective)
  get templateLabel(): TabLabelDirective {
    return this._templateLabel;
  }
  set templateLabel(value: TabLabelDirective) {
    this._setTemplateLabelInput(value);
  }

  constructor(@Inject(BIT_TAB_GROUP) @Optional() public tabGroup: any) {}

  protected _setTemplateLabelInput(value: TabLabelDirective | undefined) {
    // Only update the label if the query managed to find one. This works around an issue where a
    // user may have manually set `templateLabel` during creation mode, which would then get
    // clobbered by `undefined` when the query resolves. Also note that we check that the closest
    // tab matches the current one so that we don't pick up labels from nested tabs.
    if (value && value.closestTab === this) {
      this._templateLabel = value;
    }
  }

  get baseClassList(): string[] {
    return [
      "tw-block",
      "tw-relative",
      "tw-py-2",
      "tw-px-4",
      "tw-font-semibold",
      "tw-transition",
      "tw-rounded-t",
      "tw-border-0",
      "tw-border-x",
      "tw-border-t-4",
      "tw-border-transparent",
      "tw-border-solid",
      "!tw-text-main",
      "hover:tw-underline",
      "hover:!tw-text-main",
      "focus-visible:tw-z-10",
      "focus-visible:tw-outline-none",
      "focus-visible:tw-ring-2",
      "focus-visible:tw-ring-primary-700",
      "disabled:tw-bg-transparent",
      "disabled:!tw-text-muted/60",
      "disabled:tw-no-underline",
      "disabled:tw-cursor-not-allowed",
    ];
  }

  get activeClassList(): string {
    return [
      "tw--mb-px",
      "tw-border-x-secondary-300",
      "tw-border-t-primary-500",
      "tw-border-b",
      "tw-border-b-background",
      "tw-bg-background",
      "!tw-text-primary-500",
      "hover:tw-border-t-primary-700",
      "hover:!tw-text-primary-700",
      "focus-visible:tw-border-t-primary-700",
      "focus-visible:!tw-text-primary-700",
    ].join(" ");
  }
}

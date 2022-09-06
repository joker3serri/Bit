import { TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  ContentChild,
  Inject,
  InjectionToken,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";

import { BIT_TAB, TabLabelDirective } from "./tab-label.directive";

export const BIT_TAB_GROUP = new InjectionToken<any>("BIT_TAB_GROUP");

@Component({
  selector: "bit-tab",
  templateUrl: "./tab.component.html",
  providers: [{ provide: BIT_TAB, useExisting: TabComponent }],
  host: {
    role: "tabpanel",
  },
})
export class TabComponent implements OnInit {
  protected _templateLabel: TabLabelDirective;

  @Input() disabled = false;

  @Input("label") textLabel = "";

  @ViewChild(TemplateRef, { static: true }) implicitContent: TemplateRef<any>;

  private _contentPortal: TemplatePortal | null = null;

  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  @ContentChild(TabLabelDirective)
  get templateLabel(): TabLabelDirective {
    return this._templateLabel;
  }
  set templateLabel(value: TabLabelDirective) {
    this._setTemplateLabelInput(value);
  }

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(this.implicitContent, this._viewContainerRef);
  }

  isActive: boolean;

  constructor(
    @Inject(BIT_TAB_GROUP) @Optional() public tabGroup: any,
    private _viewContainerRef: ViewContainerRef
  ) {}

  protected _setTemplateLabelInput(value: TabLabelDirective | undefined) {
    // Only update the label if the query managed to find one. This works around an issue where a
    // user may have manually set `templateLabel` during creation mode, which would then get
    // clobbered by `undefined` when the query resolves. Also note that we check that the closest
    // tab matches the current one so that we don't pick up labels from nested tabs.
    if (value && value.closestTab === this) {
      this._templateLabel = value;
    }
  }
}

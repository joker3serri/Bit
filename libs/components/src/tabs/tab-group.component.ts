import { coerceNumberProperty } from "@angular/cdk/coercion";
import {
  AfterContentChecked,
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from "@angular/core";

import { BIT_TAB_GROUP, TabComponent } from "./tab.component";

@Component({
  selector: "bit-tab-group",
  templateUrl: "./tab-group.component.html",
  providers: [{ provide: BIT_TAB_GROUP, useExisting: TabGroupComponent }],
})
export class TabGroupComponent implements AfterContentChecked, AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  @Input()
  label = "";

  get activeTab(): TabComponent {
    return this.tabs.toArray()[this.selectedIndex];
  }

  private _indexToSelect: number | null = 0;

  /** The index of the active tab. */
  @Input()
  get selectedIndex(): number | null {
    return this._selectedIndex;
  }

  set selectedIndex(value: number) {
    this._indexToSelect = coerceNumberProperty(value, null);
  }

  private _selectedIndex: number | null = null;

  /** Output to enable support for two-way binding on `[(selectedIndex)]` */
  @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the tab selection has changed. */
  @Output() readonly selectedTabChange: EventEmitter<TabComponent> =
    new EventEmitter<TabComponent>();

  selectTab(index: number) {
    this.selectedIndex = index;
  }

  tabClasses(tab: TabComponent) {
    if (this.activeTab == tab) return tab.baseClassList.join(" ") + " " + tab.activeClassList;

    if (tab.disabled) return tab.baseClassList.concat(tab.disabledClassList);

    return tab.baseClassList;
  }

  ngAfterContentChecked(): void {
    const indexToSelect = (this._indexToSelect = this._clampTabIndex(this._indexToSelect));

    if (this._selectedIndex != indexToSelect) {
      const isFirstRun = this._selectedIndex == null;

      if (!isFirstRun) {
        this.selectedTabChange.emit(this.tabs.toArray()[indexToSelect]);
      }

      this._selectedIndex = indexToSelect;

      Promise.resolve().then(() => {
        this.tabs.forEach((tab, index) => (tab.isActive = index === indexToSelect));

        if (!isFirstRun) {
          this.selectedIndexChange.emit(indexToSelect);
        }
      });
    }
  }

  ngAfterContentInit() {
    this.tabs.changes.subscribe(() => {
      const indexToSelect = this._clampTabIndex(this._indexToSelect);

      if (indexToSelect === this._selectedIndex) {
        const tabs = this.tabs.toArray();
        let selectedTab: TabComponent | undefined;

        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i].isActive) {
            this._indexToSelect = this._selectedIndex = i;
            selectedTab = tabs[i];
            break;
          }
        }

        if (!selectedTab && tabs[indexToSelect]) {
          Promise.resolve().then(() => {
            tabs[indexToSelect].isActive = true;
            this.selectedTabChange.emit(tabs[indexToSelect]);
          });
        }
      }
    });
  }

  private _clampTabIndex(index: number | null): number {
    // Note the `|| 0`, which ensures that values like NaN can't get through
    // and which would otherwise throw the component into an infinite loop
    // (since Math.max(NaN, 0) === NaN).
    return Math.min(this.tabs.length - 1, Math.max(index || 0, 0));
  }
}

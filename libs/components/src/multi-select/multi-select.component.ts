import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from "@angular/core";
import { NgSelectComponent } from "@ng-select/ng-select";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SelectItemView } from "./models/selectItemView";

@Component({
  selector: "bit-multi-select",
  templateUrl: "./multi-select.component.html",
})
/**
 * This component has been implemented to only support Multi-select list events
 */
export class MultiSelectComponent implements OnInit {
  @ViewChild(NgSelectComponent) select: NgSelectComponent;

  // Parent component should only pass selectable items (complete list - selected items = baseItems)
  @Input() baseItems: SelectItemView[];
  // Defaults to native ng-select behavior - set to "true" to clear selected items on dropdown close
  @Input() removeSelectedItems = false;
  @Input() placeholder: string;
  @Input() loading = false;
  @Input() disabled = false;

  // Internal tracking of selected items
  selectedItems: SelectItemView[];

  // Default values for our implementation
  loadingText: string;
  notFoundText: string;
  clearAllText: string;
  bindLabel = "listName";
  groupBy = "parentGrouping";
  multipleItemSelection = true;
  selectOnTab = true;
  closeOnSelect = false;
  clearSearchOnAdd = true;

  @Output() onItemsConfirmed = new EventEmitter<any[]>();

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    this.placeholder = this.placeholder ?? this.i18nService.t("multiSelectPlaceholder");
    this.loadingText = this.i18nService.t("multiSelectLoading");
    this.notFoundText = this.i18nService.t("multiSelectNotFound");
    this.clearAllText = this.i18nService.t("multiSelectClearAll");
  }

  getSelectItemMoreText(moreCount: string): string {
    return this.i18nService.t("selectItemMore", moreCount);
  }

  isSelected(item: any): boolean {
    return this.selectedItems?.find((selected) => selected.id === item.id) != undefined;
  }

  /**
   * The `close` callback will act as the only trigger for signifying the user's intent of completing the selection
   * of items. Selected items will be emitted to the parent component in order to allow for separate data handling.
   */
  onDropdownClosed(): void {
    // Early exit
    if (this.selectedItems == null || this.selectedItems.length == 0) {
      return;
    }

    // Emit results to parent component
    this.onItemsConfirmed.emit(this.selectedItems);

    // Remove selected items from base list based on input property
    if (this.removeSelectedItems) {
      let updatedBaseItems = this.baseItems;
      this.selectedItems.forEach((selectedItem) => {
        updatedBaseItems = updatedBaseItems.filter((item) => selectedItem.id !== item.id);
      });

      // Reset Lists
      this.selectedItems = null;
      this.baseItems = updatedBaseItems;
    }
  }
}

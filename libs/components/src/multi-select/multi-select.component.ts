import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  HostBinding,
  forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgSelectComponent } from "@ng-select/ng-select";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { BitFormFieldControl } from "../form-field/form-field-control";

import { SelectItemView } from "./models/select-item-view";

// Increments for each instance of this component
let nextId = 0;

@Component({
  selector: "bit-multi-select",
  templateUrl: "./multi-select.component.html",
  providers: [
    { provide: BitFormFieldControl, useExisting: MultiSelectComponent },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
/**
 * This component has been implemented to only support Multi-select list events
 */
export class MultiSelectComponent
  implements OnInit, BitFormFieldControl<any>, ControlValueAccessor
{
  @HostBinding("attr.aria-describedby") ariaDescribedBy: string;
  @HostBinding() @Input() id = `bit-input-${nextId++}`;

  @ViewChild(NgSelectComponent) select: NgSelectComponent;

  // Parent component should only pass selectable items (complete list - selected items = baseItems)
  @Input() baseItems: SelectItemView[];
  // Defaults to native ng-select behavior - set to "true" to clear selected items on dropdown close
  @Input() removeSelectedItems = false;
  @Input() placeholder: string;
  @Input() loading = false;
  @Input() disabled = false;

  // Internal tracking of selected items
  @Input() selectedItems: SelectItemView[];

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

  protected notifyOnChange?: (value: SelectItemView[]) => void;
  protected notifyOnTouched?: () => void;

  constructor(private i18nService: I18nService) {}

  writeValue(obj: SelectItemView[]): void {
    this.selectedItems = obj;
  }

  registerOnChange(fn: (value: SelectItemView[]) => void): void {
    this.notifyOnChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.notifyOnTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    this.placeholder = this.placeholder ?? this.i18nService.t("multiSelectPlaceholder");
    this.loadingText = this.i18nService.t("multiSelectLoading");
    this.notFoundText = this.i18nService.t("multiSelectNotFound");
    this.clearAllText = this.i18nService.t("multiSelectClearAll");
  }

  isSelected(item: any): boolean {
    return this.selectedItems?.find((selected) => selected.id === item.id) != undefined;
  }

  /**
   * Defaulting the following implemented variables as false/null until there is a need to implement error states
   */
  get required(): boolean {
    return false;
  }
  get hasError(): boolean {
    return false;
  }
  get error(): [string, any] {
    return null;
  }
  get value() {
    return this;
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

  protected onChange(items: SelectItemView[]) {
    if (!this.notifyOnChange) {
      return;
    }

    this.notifyOnChange(items);
  }

  protected onBlur() {
    if (!this.notifyOnTouched) {
      return;
    }

    this.notifyOnTouched();
  }
}

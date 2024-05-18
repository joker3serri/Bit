import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";
import { MenuModule } from "../menu";
import { Option } from "../select/option";

export type OptionTree<T> = Option<T> & {
  children?: OptionTree<T>[];

  /** Internal */
  _parent?: OptionTree<T>;
};

@Component({
  selector: "bit-chip-select",
  templateUrl: "chip-select.component.html",
  standalone: true,
  imports: [CommonModule, ButtonModule, IconButtonModule, MenuModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ChipSelectComponent,
      multi: true,
    },
  ],
})
export class ChipSelectComponent<T = unknown> implements OnInit, ControlValueAccessor {
  @Input({ required: true }) placeholderText: string;
  @Input() placeholderIcon: string;

  @Input({ required: true }) options: OptionTree<T>[];

  private rootTree: OptionTree<T>;
  protected renderedOptions: OptionTree<T>;
  protected selectedOption: OptionTree<T>;
  protected selectedValue: T;

  protected selectOption(option: OptionTree<T>, _event: MouseEvent) {
    this.selectedOption = option;
    this.selectedValue = option.value;
    this.onChange(option);
  }

  protected viewOption(option: OptionTree<T>, event: MouseEvent) {
    this.renderedOptions = option;

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private findSelectedOption(tree: OptionTree<T>, value: T): OptionTree<T> | null {
    let result = null;
    if (tree.value === value) {
      return tree;
    }

    if (Array.isArray(tree.children) && tree.children.length > 0) {
      tree.children.some((node) => {
        result = this.findSelectedOption(node, value);
        return result;
      });
    }
    return result;
  }

  /** For each descendant in the provided `tree`, update `_parent` to be a refrence to the parent node. This allows us to navigate back in the menu. */
  private markParents(tree: OptionTree<T>) {
    tree.children?.forEach((child) => {
      child._parent = tree;
      this.markParents(child);
    });
  }

  ngOnInit(): void {
    const root: OptionTree<T> = {
      children: this.options,
      value: null,
    };
    this.markParents(root);
    this.rootTree = root;
    this.renderedOptions = this.rootTree;
  }

  /** Control Value Accessor */

  private notifyOnChange?: (value: T) => void;
  private notifyOnTouched?: () => void;

  /**Implemented as part of NG_VALUE_ACCESSOR */
  writeValue(obj: T): void {
    this.selectedValue = obj;
    this.selectedOption = this.findSelectedOption(this.rootTree, this.selectedValue);
  }

  /**Implemented as part of NG_VALUE_ACCESSOR */
  registerOnChange(fn: (value: T) => void): void {
    this.notifyOnChange = fn;
  }

  /**Implemented as part of NG_VALUE_ACCESSOR */
  registerOnTouched(fn: any): void {
    this.notifyOnTouched = fn;
  }

  /** TODO */
  /**Implemented as part of NG_VALUE_ACCESSOR */
  setDisabledState(isDisabled: boolean): void {
    // this.disabled = isDisabled;
  }

  /**Implemented as part of NG_VALUE_ACCESSOR */
  protected onChange(option: Option<T> | null) {
    if (!this.notifyOnChange) {
      return;
    }

    this.notifyOnChange(option?.value);
  }

  /**Implemented as part of NG_VALUE_ACCESSOR */
  protected onBlur() {
    if (!this.notifyOnTouched) {
      return;
    }

    this.notifyOnTouched();
  }
}

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";
import { MenuModule } from "../menu";
import { Option } from "../select/option";

export type ChipSelectOption<T> = Option<T> & {
  children?: ChipSelectOption<T>[];

  /** @internal populated by `ChipSelectComponent` */
  _parent?: ChipSelectOption<T>;
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

  @Input({ required: true }) options: ChipSelectOption<T>[];

  private rootTree: ChipSelectOption<T>;
  protected renderedOptions: ChipSelectOption<T>;
  protected selectedOption: ChipSelectOption<T>;

  protected selectOption(option: ChipSelectOption<T>, _event: MouseEvent) {
    this.selectedOption = option;
    this.onChange(option);
  }

  protected viewOption(option: ChipSelectOption<T>, event: MouseEvent) {
    this.renderedOptions = option;

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  protected clear() {
    this.renderedOptions = this.rootTree;
    this.selectedOption = null;
    this.onChange(null);
  }

  private findSelectedOption(tree: ChipSelectOption<T>, value: T): ChipSelectOption<T> | null {
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
  private markParents(tree: ChipSelectOption<T>) {
    tree.children?.forEach((child) => {
      child._parent = tree;
      this.markParents(child);
    });
  }

  ngOnInit(): void {
    const root: ChipSelectOption<T> = {
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
    this.selectedOption = this.findSelectedOption(this.rootTree, obj);
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

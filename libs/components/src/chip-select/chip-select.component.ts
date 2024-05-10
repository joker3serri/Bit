import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";

import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";
import { MenuModule } from "../menu";
import { Option } from "../select/option";

export type OptionTree<T> = Option<T> & {
  children?: OptionTree<T>[];
  parent?: OptionTree<T>;
};

const testData: OptionTree<any>[] = [
  {
    label: "Foo",
  },
  {
    label: "Bar",
    children: [
      {
        label: "Foo1",
      },
      {
        label: "Bar1",
        children: [
          {
            label: "Foooooooooooooooo00000000000000000000000000000000000002",
          },
          {
            label: "Bar2",
            children: [
              {
                label: "Foo3",
              },
            ],
          },
          {
            label: "Baz2",
          },
          {
            label: "Baf2",
          },
        ],
      },
    ],
  },
];

@Component({
  selector: "bit-chip-select",
  templateUrl: "chip-select.component.html",
  standalone: true,
  imports: [CommonModule, ButtonModule, IconButtonModule, MenuModule],
})
export class ChipSelectComponent<T = unknown> implements OnInit {
  // private i18nService = inject(I18nService);

  @Input() placeholder = "Placeholder";

  // name placeholder icon?
  @Input() icon: string;

  /** Optional: Options can be provided using an  input or using `bit-option` */
  @Input() items: OptionTree<T>[] = testData;

  protected renderedOptions: OptionTree<T>;

  protected selectOption(option: OptionTree<T>, event: MouseEvent) {
    this.placeholder = option.label;
  }

  protected viewOption(option: OptionTree<T>, event: MouseEvent) {
    this.renderedOptions = option;

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private markParents(tree: OptionTree<T>) {
    tree.children?.forEach((child) => {
      child.parent = tree;
      this.markParents(child);
    });
  }

  ngOnInit(): void {
    const root: OptionTree<T> = {
      children: this.items,
    };
    this.markParents(root);
    this.renderedOptions = root;
  }
}

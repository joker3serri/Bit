import { FormsModule } from "@angular/forms";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { BadgeModule } from "../badge";
import { MenuModule } from "../menu";

import { ChipSelectComponent, OptionTree } from "./chip-select.component";

export default {
  title: "Component Library/Chip Select",
  component: ChipSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [MenuModule, FormsModule, BadgeModule],
      providers: [],
    }),
  ],
} as Meta;

type Story = StoryObj<ChipSelectComponent>;

const testData: OptionTree<any>[] = [
  {
    label: "Foo",
    value: "foo",
  },
  {
    label: "Bar",
    value: "bar",
    children: [
      {
        label:
          "Bazzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
        value: "BazLong",
        children: [
          {
            label: "Hi",
            value: "hi",
          },
        ],
      },
      ...Array.from(Array(100).keys()).map((i) => ({
        label: `Baz ${i}`,
        value: i,
      })),
    ],
  },
];

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: testData,
    },
    template: /* html */ `
      <p class="tw-text-main">Selected: {{ select.value }}</p>
      <bit-chip-select 
        placeholderText="Folder"
        placeholderIcon="bwi-folder"
        [options]="options"
        ngModel
        #select="ngModel"
      ></bit-chip-select>
    `,
  }),
};

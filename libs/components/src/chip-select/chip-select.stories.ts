import { FormsModule } from "@angular/forms";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { getAllByRole, userEvent } from "@storybook/testing-library";

import { MenuModule } from "../menu";

import { ChipSelectComponent } from "./chip-select.component";

export default {
  title: "Component Library/Chip Select",
  component: ChipSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [MenuModule, FormsModule],
      providers: [],
    }),
  ],
} as Meta;

type Story = StoryObj<ChipSelectComponent & { value: any }>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
    },
    template: /* html */ `
      <bit-chip-select 
        placeholderText="Folder"
        placeholderIcon="bwi-folder"
        [options]="options"
        [ngModel]="value"
      ></bit-chip-select>
    `,
  }),
  args: {
    options: [
      {
        label: "Foo",
        value: "foo",
        icon: "bwi-folder",
      },
      {
        label: "Bar",
        value: "bar",
        icon: "bwi-exclamation-triangle tw-text-danger",
      },
      {
        label: "Baz",
        value: "baz",
        disabled: true,
      },
    ],
  },
  play: async (context) => {
    const canvas = context.canvasElement;
    const buttons = getAllByRole(canvas, "button");
    await userEvent.click(buttons[0]);
  },
};

export const NestedOptions: Story = {
  ...Default,
  args: {
    options: [
      {
        label: "Foo",
        value: "foo",
        icon: "bwi-folder",
        children: [
          {
            label: "Foo1",
            value: "foo1",
            icon: "bwi-folder",
            children: [
              {
                label: "Foo2",
                value: "foo2",
                icon: "bwi-folder",
                children: [
                  {
                    label: "Foo3",
                    value: "foo3",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: "Bar",
        value: "bar",
        icon: "bwi-folder",
      },
      {
        label: "Baz",
        value: "baz",
        icon: "bwi-folder",
      },
    ],
    value: "foo1",
  },
};

export const TextOverflow: Story = {
  ...Default,
  args: {
    options: [
      {
        label: "Fooooooooooooooooooooooooooooooooooooooooooooo",
        value: "foo",
      },
    ],
    value: "foo",
  },
};

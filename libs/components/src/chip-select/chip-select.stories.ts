import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { MenuModule } from "../menu";

import { ChipSelectComponent } from "./chip-select.component";

export default {
  title: "Component Library/Chip Select",
  component: ChipSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [MenuModule],
      providers: [],
    }),
  ],
} as Meta;

type Story = StoryObj<ChipSelectComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: /* html */ `
      <bit-chip-select placeholder="Folder" icon="bwi-key">
        <bit-option label="Foo"></bit-option>
        <bit-option label="Bar"></bit-option>
        <bit-option label="Baz">
          <bit-option label="Foo"></bit-option>
        </bit-option>
      </bit-chip-select>
    `,
  }),
};

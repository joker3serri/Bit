import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { DialogModule } from "../dialog";

import { BitIconButtonComponent } from "./icon-button.component";

export default {
  title: "Component Library/Icon Button",
  component: BitIconButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [DialogModule],
    }),
  ],
  args: {
    bitIconButton: "bwi-plus",
    style: "primary",
    size: "default",
    disabled: false,
  },
} as Meta;

const Template: Story<BitIconButtonComponent> = (args: BitIconButtonComponent) => ({
  props: args,
  template: `
  <div class="tw-p-5" [class.tw-bg-primary-500]="style === 'contrast'">
    <button [bitIconButton]="bitIconButton" [style]="style" [size]="size" [disabled]="disabled"></button>
  </div>
  `,
});

export const Contrast = Template.bind({});
Contrast.args = {
  style: "contrast",
};

export const Main = Template.bind({});
Main.args = {
  style: "main",
};

export const Muted = Template.bind({});
Muted.args = {
  style: "muted",
};

export const Primary = Template.bind({});
Primary.args = {
  style: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  style: "secondary",
};

export const Danger = Template.bind({});
Danger.args = {
  style: "danger",
};

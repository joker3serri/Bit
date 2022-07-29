import { Meta, Story } from "@storybook/angular";

import { BitIconComponent } from "./icon.component";

export default {
  title: "Component Library/Icon",
  component: BitIconComponent,
  args: {
    icon: "reportExposedPasswords",
  },
} as Meta;

const Template: Story<BitIconComponent> = (args: BitIconComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {
  buttonType: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  buttonType: "secondary",
};

export const Danger = Template.bind({});
Danger.args = {
  buttonType: "danger",
};

const DisabledTemplate: Story = (args) => ({
  props: args,
  template: `
    <button bitButton disabled buttonType="primary" class="tw-mr-2">Primary</button>
    <button bitButton disabled buttonType="secondary" class="tw-mr-2">Secondary</button>
    <button bitButton disabled buttonType="danger" class="tw-mr-2">Danger</button>
  `,
});

export const Disabled = DisabledTemplate.bind({});
Disabled.args = {
  size: "small",
};

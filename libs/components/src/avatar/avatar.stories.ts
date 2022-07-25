import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

import { AvatarComponent } from "./avatar.component";

export default {
  title: "Component Library/Avatar",
  component: AvatarComponent,
  decorators: [
    moduleMetadata({
      providers: [
        CryptoFunctionService,
        {
          provide: StateService,
          useValue: {
            getEnableGravitars: () => {
              return;
            },
          },
        },
      ],
    }),
  ],
  args: {
    data: "Walt Walterson",
    color: "#175ddc",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A16994",
    },
  },
} as Meta;

const Template: Story<AvatarComponent> = (args: AvatarComponent) => ({
  props: args,
  template: `
    <bit-avatar [data]="data" [size]="size" [color]="color" [border]="border"></bit-avatar>
  `,
});

export const Default = Template.bind({});
Default.args = {};

export const Large = Template.bind({});
Large.args = {
  size: "large",
};

export const Small = Template.bind({});
Small.args = {
  size: "small",
};

export const LightBackground = Template.bind({});
LightBackground.args = {
  color: "#d2ffcf",
};

export const Border = Template.bind({});
Border.args = {
  border: true,
};

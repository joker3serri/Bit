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
    name: "Walt Walterson",
    size: "large",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1717%3A15868",
    },
  },
} as Meta;

const Template: Story<AvatarComponent> = (args: AvatarComponent) => ({
  props: args,
  template: `
    <bit-avatar [data]="name" [size]="size" [circle]="circle"></bit-avatar>
  `,
});

export const Default = Template.bind({});
Default.args = {};

export const Medium = Template.bind({});
Medium.args = {
  size: "medium",
};

export const Small = Template.bind({});
Small.args = {
  size: "small",
};

export const Circle = Template.bind({});
Circle.args = {
  circle: true,
};

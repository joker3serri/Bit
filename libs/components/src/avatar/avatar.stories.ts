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
    name: "Jason Doe",
  },
} as Meta;

const Template: Story<AvatarComponent> = (args: AvatarComponent) => ({
  props: args,
  template: `
    <bit-avatar [data]="name" circle="true"></bit-avatar>
  `,
});

export const Default = Template.bind({});
Default.args = {};

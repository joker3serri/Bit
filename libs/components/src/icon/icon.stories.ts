import { Meta, StoryObj } from "@storybook/angular";

import { UserVerificationBiometricsIcon } from "../../../auth/src/angular/icons/user-verification-biometrics-fingerprint.icon";

import { BitIconComponent } from "./icon.component";
import * as GenericIcons from "./icons";

export default {
  title: "Component Library/Icon",
  component: BitIconComponent,
} as Meta;

type Story = StoryObj<BitIconComponent>;

export const GenericIcon: Story = {
  args: {
    icon: GenericIcons.NoAccess,
  },
  argTypes: {
    icon: {
      options: Object.keys(GenericIcons),
      mapping: GenericIcons,
      control: { type: "select" },
    },
  },
};

export const CustomIcon: Story = {
  args: {
    icon: UserVerificationBiometricsIcon,
  },
};

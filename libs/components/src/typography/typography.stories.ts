import { Meta, StoryObj } from "@storybook/angular";

import { TypographyDirective } from "./typography.directive";

export default {
  title: "Component Library/Typography",
  component: TypographyDirective,
} as Meta;

type Story = StoryObj<TypographyDirective>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <div bitTypography="h1">h1</div>
      <div bitTypography="h2">h2</div>
      <div bitTypography="h3">h3</div>
      <div bitTypography="h4">h4</div>
      <div bitTypography="h5">h5</div>
      <div bitTypography="h6">h6</div>
      <div bitTypography="body1" class="tw-text-main">body1</div>
      <div bitTypography="body2" class="tw-text-main">body2</div>
      <div bitTypography="helper" class="tw-text-main">helper</div>
    `,
  }),
};

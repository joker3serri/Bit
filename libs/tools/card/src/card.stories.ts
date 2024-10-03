import { CommonModule } from "@angular/common";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { TypographyModule } from "@bitwarden/components";

import { CardComponent } from "./card.component";

export default {
  title: "Toools/Card",
  component: CardComponent,
  decorators: [
    moduleMetadata({
      imports: [CardComponent, CommonModule, TypographyModule],
    }),
  ],
} as Meta;

type Story = StoryObj<CardComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <tools-card [title]="'Unsecured Members'" [mainText]="'38'" [subText]="'out of 157'"></tools-card>`,
  }),
};

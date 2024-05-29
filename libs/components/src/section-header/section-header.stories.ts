import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CardComponent } from "../../src/card";
import { IconButtonModule } from "../../src/icon-button";
import { SectionComponent } from "../../src/section";
import { TypographyModule } from "../../src/typography";
import { ItemGroupComponent } from "../item/item-group.component";
import { ItemComponent } from "../item/item.component";

import { SectionHeaderComponent } from "./section-header.component";

export default {
  title: "Component Library/Section Header",
  component: SectionHeaderComponent,
  args: {
    title: "Title",
  },
  decorators: [
    moduleMetadata({
      imports: [
        SectionComponent,
        CardComponent,
        TypographyModule,
        IconButtonModule,
        ItemComponent,
        ItemGroupComponent,
      ],
    }),
  ],
} as Meta<SectionHeaderComponent>;

type Story = StoryObj<SectionHeaderComponent>;

export const OnlyTitle: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-section-header>
        <h2 bitTypography="h6" noMargin slot="title">
          {{ title }}
        </h2>
       </bit-section-header>
    `,
  }),
  args: {
    title: "Only Title",
  },
};

export const TrailingText: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-section-header>
        <h2 bitTypography="h6" noMargin slot="title">
          {{ title }}
        </h2>
        <span bitTypography="body2" slot="end">13</span>
      </bit-section-header>
    `,
  }),
  args: {
    title: "Trailing Text",
  },
};

export const TrailingIcon: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-section-header>
        <h2 bitTypography="h6" noMargin slot="title">
          {{ title }}
        </h2>
        <button bitIconButton="bwi-star" size="small" slot="end"></button>
      </bit-section-header>
    `,
  }),
  args: {
    title: "Trailing Icon",
  },
};

export const TitleSuffix: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-section-header>
        <ng-container slot="title">
          <h2 bitTypography="h6" noMargin slot="title">
            {{ title }}
          </h2>
          <button bitIconButton="bwi-refresh" size="small"></button>
        </ng-container>
      </bit-section-header>
    `,
  }),
  args: {
    title: "Title Suffix",
  },
};

export const WithPadding: Story = {
  render: () => ({
    template: /*html*/ `
      <div class="tw-bg-background-alt tw-p-2">
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              Card as immediate sibling
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <bit-card>
            <h3 bitTypography="h3">bit-section-header has bottom padding</h3>
          </bit-card>
        </bit-section>
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              Card nested in immediate sibling
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <div>
            <bit-card>
              <h3 bitTypography="h3">bit-section-header has bottom padding</h3>
            </bit-card>
          </div>
        </bit-section>
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              Item as immediate sibling
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <bit-item>
            <p bitTypography="body1">bit-section-header has bottom padding</p>
          </bit-item>
        </bit-section>
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              Item nested in immediate sibling
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <bit-item-group>
            <bit-item>
              <p bitTypography="body1">bit-section-header has bottom padding</p>
            </bit-item>
          </bit-item-group>
        </bit-section>
      </div>
    `,
  }),
};

export const WithoutPadding: Story = {
  render: () => ({
    template: /*html*/ `
      <div class="tw-bg-background-alt tw-p-2">
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              No card or item used
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <div class="tw-bg-background">
            <h3 bitTypography="h3">just a div, so bit-section-header has no bottom padding</h3>
          </div>
        </bit-section>
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              Card nested in non-immediate sibling
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <div>
            <div>
              some content here
            </div>
            <button>a random button</button>
          </div>
          <bit-card>
            <h3 bitTypography="h3">bit-section-header has no bottom padding</h3>
          </bit-card>
        </bit-section>
      </div>
    `,
  }),
};

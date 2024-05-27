import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CardComponent } from "../../src/card";
import { IconButtonModule } from "../../src/icon-button";
import { SectionComponent } from "../../src/section";
import { TypographyModule } from "../../src/typography";

import { SectionHeaderComponent } from "./section-header.component";

export default {
  title: "Component Library/Section Header",
  component: SectionHeaderComponent,
  args: {
    title: "Title",
  },
  decorators: [
    moduleMetadata({
      imports: [SectionComponent, CardComponent, TypographyModule, IconButtonModule],
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
        <h2 bitTypography="h6" noMargin slot="title">
          {{ title }}
        </h2>
        <button bitIconButton="bwi-refresh" size="small" slot="title-suffix"></button>
      </bit-section-header>
    `,
  }),
  args: {
    title: "Title Suffix",
  },
};

export const InSectionWithCard: Story = {
  render: () => ({
    template: /*html*/ `
      <div class="tw-bg-background-alt tw-p-2">
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              I'm a section header
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <bit-card>
            <h3 bitTypography="h3">I'm card content</h3>
          </bit-card>
        </bit-section>
      </div>
    `,
  }),
};

export const InSectionWithoutPadding: Story = {
  render: () => ({
    template: /*html*/ `
      <div class="tw-bg-background-alt tw-p-2">
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              No card used
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
              Card nested in immediate sibling
            </h2>
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </bit-section-header>
          <div>
            <div>
              some content here
            </div>
            <button>a random button</button>
            <bit-card>
              <h3 bitTypography="h3">bit-section-header has no bottom padding</h3>
            </bit-card>
          </div>
        </bit-section>
        <bit-section>
          <bit-section-header>
            <h2 bitTypography="h6" noMargin slot="title">
              Card not immediate sibling
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

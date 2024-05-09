import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { CardComponent } from "../../../../../../libs/components/src/card";
import { IconButtonModule } from "../../../../../../libs/components/src/icon-button";
import { SectionComponent } from "../../../../../../libs/components/src/section";
import { TypographyModule } from "../../../../../../libs/components/src/typography";

import { PopupSectionHeaderComponent } from "./popup-section-header.component";

export default {
  title: "Browser/Popup Section Header",
  component: PopupSectionHeaderComponent,
  decorators: [
    moduleMetadata({
      imports: [TypographyModule, IconButtonModule, SectionComponent, CardComponent],
    }),
  ],
} as Meta<PopupSectionHeaderComponent>;

type Story = StoryObj<PopupSectionHeaderComponent>;

export const OnlyTitle: Story = {
  render: () => ({
    template: `
      <popup-section-header>
        <h2 bitTypography="h6" noMargin class="tw-mb-0" slot="title">
          Only Title
        </h2>
      </popup-section-header>
    `,
  }),
};

export const TrailingText: Story = {
  render: () => ({
    template: `
      <popup-section-header>
        <h2 bitTypography="h6" noMargin class="tw-mb-0" slot="title">
          Trailing Text
        </h2>
        <span bitTypography="body2" slot="end">13</span>
      </popup-section-header>
    `,
  }),
};

export const TailingIcon: Story = {
  render: () => ({
    template: `
      <popup-section-header>
        <h2 bitTypography="h6" noMargin class="tw-mb-0" slot="title">
          Trailing Icon
        </h2>
        <button bitIconButton="bwi-star" slot="end"></button>
      </popup-section-header>
    `,
  }),
};

export const WithSections: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="tw-bg-background-alt tw-p-2">
        <bit-section>
          <popup-section-header>
            <h2 bitTypography="h6" noMargin class="tw-mb-0" slot="title">
              Section 1
            </h2>
            <button bitIconButton="bwi-star" slot="end">1</button>
          </popup-section-header>
          <bit-card>
            <h3 bitTypography="h3">Card 1 Content</h3>
          </bit-card>
        </bit-section>
        <bit-section>
          <popup-section-header>
            <h2 bitTypography="h6" noMargin class="tw-mb-0" slot="title">
              Section 2
            </h2>
            <button bitIconButton="bwi-star" slot="end">2</button>
          </popup-section-header>
          <bit-card>
            <h3 bitTypography="h3">Card 2 Content</h3>
          </bit-card>
        </bit-section>
      </div>
    `,
  }),
};

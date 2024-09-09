import { ReactiveFormsModule } from "@angular/forms";
import { moduleMetadata, Meta, StoryObj } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { I18nMockService } from "@bitwarden/components";

import { SliderComponent } from "./slider.component";

export default {
  title: "Tools/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [SliderComponent, ReactiveFormsModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              rangeSliderOutOfRange: "Value must be between {min} and {max}.",
            });
          },
        },
      ],
    }),
  ],
} as Meta<SliderComponent>;

type Story = StoryObj<SliderComponent>;

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <div style='width: 17rem'>
        <bit-slider [min]="min" [max]="max"></bit-slider>
      </div>
    `,
  }),
};

export const ErrorState: Story = {
  args: {
    min: 0,
    max: 100,
    initialValue: 150,
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <div style='width: 17rem'>
        <bit-slider [min]="min" [max]="max" [initialValue]="initialValue"></bit-slider>
      </div>
    `,
  }),
};

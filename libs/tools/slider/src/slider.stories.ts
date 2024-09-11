import { ReactiveFormsModule } from "@angular/forms";
import { moduleMetadata, Meta, StoryObj } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CardComponent, I18nMockService, InputModule } from "@bitwarden/components";

import { SliderComponent } from "./slider.component";

export default {
  title: "Tools/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [CardComponent, InputModule, SliderComponent, ReactiveFormsModule],
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
  render: () => ({
    props: {
      min: 0,
      max: 100,
    },
    template: `
      <bit-card>
        <tools-slider label="Default" [min]="min" [max]="max"></tools-slider>
      </bit-card>
    `,
  }),
};

export const ErrorState: Story = {
  render: () => ({
    props: {
      min: 0,
      max: 100,
      initialValue: 150,
    },
    template: `
      <bit-card>
        <tools-slider label="Error" [min]="min" [max]="max" [initialValue]="initialValue"></tools-slider>
      </bit-card>
    `,
  }),
};

export const InputOnly: Story = {
  render: () => ({
    props: {
      min: 0,
      max: 100,
    },
    template: `
      <bit-card>
        <input
          toolsSlider
          [min]="0"
          [max]="100"
          [step]="1"
          value="50"
        />
      </bit-card>
    `,
  }),
};

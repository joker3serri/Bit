import { ReactiveFormsModule } from "@angular/forms";
import { moduleMetadata, Meta, StoryObj } from "@storybook/angular";

import { SliderComponent } from "./slider.component";

export default {
  title: "Tools/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [SliderComponent, ReactiveFormsModule],
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
      <bit-slider [min]="min" [max]="max"></bit-slider>
    `,
  }),
};

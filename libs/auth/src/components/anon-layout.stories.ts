import { Meta, StoryObj, componentWrapperDecorator, moduleMetadata } from "@storybook/angular";

import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { ButtonModule } from "../../../components/src/button";

import { AnonLayoutComponent } from "./anon-layout.component";

class MockPlatformUtilsService implements Partial<PlatformUtilsService> {
  getApplicationVersion = () => Promise.resolve("Version 2023.1.1");
}

export default {
  title: "Auth/Anon Layout",
  component: AnonLayoutComponent,
  decorators: [
    componentWrapperDecorator(
      /**
       * Applying a CSS transform makes a `position: fixed` element act like it is `position: relative`
       * https://github.com/storybookjs/storybook/issues/8011#issue-490251969
       */
      (story) =>
        /* HTML */ `<div class="tw-scale-100 tw-border-2 tw-border-solid tw-border-[red]">
          ${story}
        </div>`,
    ),
    moduleMetadata({
      imports: [ButtonModule],
      providers: [
        {
          provide: PlatformUtilsService,
          useClass: MockPlatformUtilsService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AnonLayoutComponent>;

export const Empty: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <auth-anon-layout title="Page Title" subTitle="Subtitle here"> </auth-anon-layout>
    `,
  }),
};

export const WithContent: Story = {
  render: (args) => ({
    props: args,
    template:
      /**
       * The projected content (i.e. the <div> ) and styling below is just a
       * sample and could be replaced with any content and styling
       */
      `
      <auth-anon-layout title="Page Title" subTitle="Subtitle here">
        <div
          class="tw-flex tw-h-80 tw-flex-col tw-items-center tw-justify-center tw-bg-secondary-100"
        >
          Sample Projected Content
        </div>
      </auth-anon-layout>
    `,
  }),
};

export const WithSecondaryContent: Story = {
  render: (args) => ({
    props: args,
    template:
      // Notice that slot="secondary" is requred to project any secondary content:
      `
      <auth-anon-layout title="Page Title" subTitle="Subtitle here">
        <div
          class="tw-flex tw-h-80 tw-flex-col tw-items-center tw-justify-center tw-bg-secondary-100"
        >
          Sample Projected Content
        </div>

        <div slot="secondary">
          <h3 class="tw-mb-3 tw-text-xl sm:tw-text-2xl tw-font-semibold">Secondary Content</h3>
          <button bitButton>Perform Action</button>
        </div>
      </auth-anon-layout>
    `,
  }),
};

export const WithLongContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-anon-layout title="Page Title" subTitle="Subtitle here Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita, quod est?
      ">
        <div
          class="tw-bg-secondary-100"
        >
          Sample Projected Content Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?   Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?
        </div>

        <div slot="secondary">
          <h3 class="tw-mb-3 tw-text-xl sm:tw-text-2xl tw-font-semibold">Secondary Content</h3>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laborum nostrum natus. Expedita, quod est?          </p>
          <button bitButton>Perform Action</button>
        </div>
      </auth-anon-layout>
    `,
  }),
};

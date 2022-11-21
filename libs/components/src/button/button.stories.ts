import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonComponent } from "./button.component";
import {
  ButtonDangerDirective,
  ButtonPrimaryDirective,
  ButtonSecondaryDirective,
} from "./button-style.directive";

export default {
  title: "Component Library/Button",
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      declarations: [ButtonPrimaryDirective, ButtonSecondaryDirective, ButtonDangerDirective],
    }),
  ],
  args: {
    disabled: false,
    loading: false,
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=5115%3A26950",
    },
  },
} as Meta;

const PrimaryTemplate: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <button bitButton bitPrimary [disabled]="disabled" [loading]="loading" [block]="block">Button</button>
    <a bitButton bitPrimary [disabled]="disabled" [loading]="loading" [block]="block" href="#" class="tw-ml-2">Link</a>
  `,
});
export const Primary = PrimaryTemplate.bind({});

const SecondaryTemplate: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <button bitButton bitSecondary [disabled]="disabled" [loading]="loading" [block]="block">Button</button>
    <a bitButton bitSecondary [disabled]="disabled" [loading]="loading" [block]="block" href="#" class="tw-ml-2">Link</a>
  `,
});
export const Secondary = SecondaryTemplate.bind({});

const DangerTemplate: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <button bitButton bitDanger [disabled]="disabled" [loading]="loading" [block]="block">Button</button>
    <a bitButton bitDanger [disabled]="disabled" [loading]="loading" [block]="block" href="#" class="tw-ml-2">Link</a>
  `,
});
export const Danger = DangerTemplate.bind({});

const AllStylesTemplate: Story = (args) => ({
  props: args,
  template: `
    <button bitButton bitPrimary [disabled]="disabled" [loading]="loading" [block]="block" class="tw-mr-2">Primary</button>
    <button bitButton bitSecondary [disabled]="disabled" [loading]="loading" [block]="block" class="tw-mr-2">Secondary</button>
    <button bitButton bitDanger [disabled]="disabled" [loading]="loading" [block]="block" class="tw-mr-2">Danger</button>
  `,
});

export const Loading = AllStylesTemplate.bind({});
Loading.args = {
  disabled: false,
  loading: true,
};

export const Disabled = AllStylesTemplate.bind({});
Disabled.args = {
  disabled: true,
  loading: false,
};

const DisabledWithAttributeTemplate: Story = (args) => ({
  props: args,
  template: `
    <ng-container *ngIf="disabled">
      <button bitButton bitPrimary disabled [loading]="loading" [block]="block" class="tw-mr-2">Primary</button>
      <button bitButton bitSecondary disabled [loading]="loading" [block]="block" class="tw-mr-2">Secondary</button>
      <button bitButton bitDanger disabled [loading]="loading" [block]="block" class="tw-mr-2">Danger</button>
    </ng-container>
    <ng-container *ngIf="!disabled">
      <button bitButton bitPrimary [loading]="loading" [block]="block" class="tw-mr-2">Primary</button>
      <button bitButton bitSecondary [loading]="loading" [block]="block" class="tw-mr-2">Secondary</button>
      <button bitButton bitDanger [loading]="loading" [block]="block" class="tw-mr-2">Danger</button>
    </ng-container>
  `,
});

export const DisabledWithAttribute = DisabledWithAttributeTemplate.bind({});
DisabledWithAttribute.args = {
  disabled: true,
  loading: false,
};

const BlockTemplate: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <span class="tw-flex">
      <button bitButton bitPrimary [block]="block">[block]="true" Button</button>
      <a bitButton bitPrimary [block]="block" href="#" class="tw-ml-2">[block]="true" Link</a>

      <button bitButton bitPrimary block class="tw-ml-2">block Button</button>
      <a bitButton bitPrimary block href="#" class="tw-ml-2">block Link</a>
    </span>
  `,
});

export const Block = BlockTemplate.bind({});
Block.args = {
  block: true,
};

import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonComponent, ButtonDangerDirective, ButtonPrimaryDirective, ButtonSecondaryDirective } from "./button.component";

export default {
  title: "Component Library/Button",
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      declarations: [ButtonPrimaryDirective, ButtonSecondaryDirective, ButtonDangerDirective],
    })],
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
    <button bitButton bitButtonPrimary [disabled]="disabled" [loading]="loading" [block]="block">Button</button>
    <a bitButton [disabled]="disabled" [loading]="loading" [block]="block" href="#" class="tw-ml-2">Link</a>
  `,
});

export const Primary = PrimaryTemplate.bind({});
Primary.args = {
};

const SecondaryTemplate: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <button bitButton bitButtonSecondary [disabled]="disabled" [loading]="loading" [block]="block">Button</button>
    <a bitButton [disabled]="disabled" [loading]="loading" [block]="block" href="#" class="tw-ml-2">Link</a>
  `,
});

export const Secondary = SecondaryTemplate.bind({});
Secondary.args = {
};

const DangerTemplate: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
  template: `
    <button bitButton bitButtonDanger [disabled]="disabled" [loading]="loading" [block]="block">Button</button>
    <a bitButton [disabled]="disabled" [loading]="loading" [block]="block" href="#" class="tw-ml-2">Link</a>
  `,
});

export const Danger = DangerTemplate.bind({});
Danger.args = {
};

const AllStylesTemplate: Story = (args) => ({
  props: args,
  template: `
    <button bitButton [disabled]="disabled" [loading]="loading" [block]="block" class="tw-mr-2">Primary</button>
    <button bitButton [disabled]="disabled" [loading]="loading" [block]="block" class="tw-mr-2">Secondary</button>
    <button bitButton [disabled]="disabled" [loading]="loading" [block]="block" class="tw-mr-2">Danger</button>
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
      <button bitButton disabled [loading]="loading" [block]="block" class="tw-mr-2">Primary</button>
      <button bitButton disabled [loading]="loading" [block]="block" class="tw-mr-2">Secondary</button>
      <button bitButton disabled [loading]="loading" [block]="block" class="tw-mr-2">Danger</button>
    </ng-container>
    <ng-container *ngIf="!disabled">
      <button bitButton [loading]="loading" [block]="block" class="tw-mr-2">Primary</button>
      <button bitButton [loading]="loading" [block]="block" class="tw-mr-2">Secondary</button>
      <button bitButton [loading]="loading" [block]="block" class="tw-mr-2">Danger</button>
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
      <button bitButton [block]="block">[block]="true" Button</button>
      <a bitButton [block]="block" href="#" class="tw-ml-2">[block]="true" Link</a>

      <button bitButton block class="tw-ml-2">block Button</button>
      <a bitButton block href="#" class="tw-ml-2">block Link</a>
    </span>
  `,
});

export const Block = BlockTemplate.bind({});
Block.args = {
  block: true,
};

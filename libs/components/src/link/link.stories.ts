import { Meta, Story } from "@storybook/angular";

import { LinkDirective } from "./link.directive";

export default {
  title: "Component Library/Link",
  component: LinkDirective,
  args: {
    linkType: "primary",
    rootClasses: "tw-bg-transparent tw-table-auto",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A18454",
    },
  },
} as Meta;

const Template: Story<LinkDirective> = (args: LinkDirective) => ({
  props: args,
  template: `
  <table [class]="rootClasses">
  <tbody>
    <tr>
      <td>
        <button bitLink [linkType]="linkType">Button</button>
      </td>
      <td>
        <a bitLink [linkType]="linkType" href="#">Link</a>
      </td>
    </tr>
    <tr>
      <td>
        <button bitLink [linkType]="linkType">
          <i class="bwi bwi-fw bwi-plus-circle" aria-hidden="true"></i>
          Add Icon Button
        </button>
      </td>
      <td>
        <a bitLink [linkType]="linkType" href="#">
          <i class="bwi bwi-fw bwi-plus-circle" aria-hidden="true"></i>
        Add Icon Link
        </a>
      </td>
    </tr>
    <tr>
      <td>
        <button bitLink [linkType]="linkType">
          Chevron Icon Button
          <i class="bwi bwi-fw bwi-sm bwi-angle-down" aria-hidden="true"></i>
        </button>
      </td>
      <td>
        <a bitLink [linkType]="linkType" href="#">
          Chevron Icon Link
          <i class="bwi bwi-fw bwi-sm bwi-angle-down" aria-hidden="true"></i>
        </a>
      </td>
    </tr>
    <tr>
      <td>
        <button bitLink [linkType]="linkType" class="tw-text-sm">Small Button</button>
      </td>
      <td>
        <a bitLink [linkType]="linkType" class="tw-text-sm" href="#">Small Link</a>
      </td>
    </tr>
  </tbody>
</table>
  `,
});

export const Primary = Template.bind({});
Primary.args = {
  linkType: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  linkType: "secondary",
};

export const Contrast = Template.bind({});
Contrast.args = {
  linkType: "contrast",
  rootClasses: "tw-bg-primary-500 tw-table-auto",
};

const DisabledTemplate: Story = (args) => ({
  props: args,
  template: `
    <button bitLink disabled linkType="primary" class="tw-mr-2">Primary</button>
    <button bitLink disabled linkType="secondary" class="tw-mr-2">Secondary</button>
    <div [class]="divClasses">
      <button bitLink disabled linkType="contrast" class="tw-mr-2">Contrast</button>
    </div>
  `,
});

export const Disabled = DisabledTemplate.bind({});
Disabled.args = {
  divClasses: "tw-bg-primary-500 tw-p-2 tw-inline-block",
};

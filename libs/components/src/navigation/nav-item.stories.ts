import { RouterTestingModule } from "@angular/router/testing";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { NavItemComponent } from "./nav-item.component";

export default {
  title: "Component Library/Nav/Nav Item",
  component: NavItemComponent,
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [RouterTestingModule],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=4687%3A86642",
    },
  },
} as Meta;

const Template: Story<NavItemComponent> = (args: NavItemComponent) => ({
  props: args,
  template: `
      <nav-item title="${args.title}" to="${args.to}" icon="${args.icon}"></nav-item>
    `,
});

export const Default = Template.bind({});
Default.args = {
  title: "Hello World",
  to: "",
  icon: "bwi-filter",
};

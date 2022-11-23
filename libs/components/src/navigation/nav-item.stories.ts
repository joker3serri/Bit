import { RouterTestingModule } from "@angular/router/testing";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { IconButtonModule } from "../icon-button";

import { NavItemComponent } from "./nav-item.component";

export default {
  title: "Component Library/Nav/Nav Item",
  component: NavItemComponent,
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [RouterTestingModule, IconButtonModule],
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
      <nav-item text="${args.text}"  [route]="['']" icon="${args.icon}"></nav-item>
    `,
});

export const Default = Template.bind({});
Default.args = {
  text: "Hello World",
  icon: "bwi-filter",
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  text: "Hello World",
  icon: "",
};

export const WithoutRoute: Story<NavItemComponent> = (args: NavItemComponent) => ({
  props: args,
  template: `
      <nav-item text="Hello World" icon="bwi-collection"></nav-item>
    `,
});

export const WithSlots: Story<NavItemComponent> = (args: NavItemComponent) => ({
  props: args,
  template: `
      <nav-item text="Hello World" [route]="['']" icon="bwi-collection">
        <button
          slot-start
          class="tw-ml-auto"
          [bitIconButton]="'bwi-clone'"
          [buttonType]="'contrast'"
          size="small"
          text="test"
        ></button>
        <button
          slot-end
          class="tw-ml-auto"
          [bitIconButton]="'bwi-pencil-square'"
          [buttonType]="'contrast'"
          size="small"
          text="test"
        ></button>
        <button
          slot-end
          class="tw-ml-auto"
          [bitIconButton]="'bwi-check'"
          [buttonType]="'contrast'"
          size="small"
          text="test"
        ></button>
      </nav-item>
    `,
});

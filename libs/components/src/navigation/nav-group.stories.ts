import { RouterTestingModule } from "@angular/router/testing";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SharedModule } from "../shared/shared.module";
import { I18nMockService } from "../utils/i18n-mock.service";

import { NavGroupComponent } from "./nav-group.component";
import { NavigationModule } from "./navigation.module";

export default {
  title: "Component Library/Nav/Nav Group",
  component: NavGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedModule, RouterTestingModule, NavigationModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              submenu: "submenu",
              toggleCollapse: "toggle collapse",
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=4687%3A86642",
    },
  },
} as Meta;

export const Default: Story<NavGroupComponent> = (args) => ({
  props: args,
  template: `
      <nav-group text="Hello World (Anchor)" route="#" icon="bwi-filter">
        <nav-item text="Child A" route="#" icon="bwi-filter"></nav-item>
        <nav-item text="Child B" route="#"></nav-item>
        <nav-item text="Child C" route="#" icon="bwi-filter"></nav-item>
      </nav-group>
      <nav-group text="Lorem Ipsum (Button)" icon="bwi-filter">
        <nav-item text="Child A" icon="bwi-filter"></nav-item>
        <nav-item text="Child B"></nav-item>
        <nav-item text="Child C" icon="bwi-filter"></nav-item>
      </nav-group>
    `,
});

export const Tree: Story<NavGroupComponent> = (args) => ({
  props: args,
  template: `
    <nav-group text="Tree example" icon="bwi-collection" open>
      <nav-group text="Level 1 - with children (empty)" route="#" icon="bwi-collection" variant="tree"></nav-group>
      <nav-item text="Level 1 - no childen" route="#" icon="bwi-collection" variant="tree"></nav-item>
      <nav-group text="Level 1 - with children" route="#" icon="bwi-collection" variant="tree">
        <nav-group text="Level 2 - with children" route="#" icon="bwi-collection" variant="tree">
          <nav-item text="Level 3 - no childen, no icon" route="#" variant="tree"></nav-item>
          <nav-group text="Level 3 - with children" route="#" icon="bwi-collection" variant="tree">
            <nav-item text="Level 4 - no childen, no icon" route="#" variant="tree"></nav-item>
          </nav-group>
        </nav-group>
        <nav-group text="Level 2 - with children (empty)" route="#" icon="bwi-collection" variant="tree"></nav-group>
        <nav-item text="Level 2 - no childen" route="#" icon="bwi-collection" variant="tree"></nav-item>
      </nav-group>
      <nav-item text="Level 1 - no childen" route="#" icon="bwi-collection" variant="tree"></nav-item>
    </nav-group>
  `,
});

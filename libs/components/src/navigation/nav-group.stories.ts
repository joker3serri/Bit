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
              required: "required",
              inputRequired: "Input is required.",
              inputEmail: "Input is not an email-address.",
              fieldsNeedAttention: "$COUNT$ field(s) above need your attention.",
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
      <nav-group title="Hello World (Anchor)" route="#" icon="bwi-filter">
        <nav-item title="Child A" route="#" icon="bwi-filter"></nav-item>
        <nav-item title="Child B" route="#"></nav-item>
        <nav-item title="Child C" route="#" icon="bwi-filter"></nav-item>
      </nav-group>
      <nav-group title="Lorem Ipsum (Button)" icon="bwi-filter">
        <nav-item title="Child A" icon="bwi-filter"></nav-item>
        <nav-item title="Child B"></nav-item>
        <nav-item title="Child C" icon="bwi-filter"></nav-item>
      </nav-group>
    `,
});

export const Tree: Story<NavGroupComponent> = (args) => ({
  props: args,
  template: `
    <nav-group title="Tree example" icon="bwi-collection" open>
      <nav-group title="Level 1 - with children (empty)" route="#" icon="bwi-collection" variant="tree"></nav-group>
      <nav-item title="Level 1 - no childen" route="#" icon="bwi-collection" variant="tree"></nav-item>
      <nav-group title="Level 1 - with children" route="#" icon="bwi-collection" variant="tree">
        <nav-group title="Level 2 - with children" route="#" icon="bwi-collection" variant="tree">
          <nav-item title="Level 3 - no childen, no icon" route="#" variant="tree"></nav-item>
          <nav-group title="Level 3 - with children" route="#" icon="bwi-collection" variant="tree">
            <nav-item title="Level 4 - no childen, no icon" route="#" variant="tree"></nav-item>
          </nav-group>
        </nav-group>
        <nav-group title="Level 2 - with children (empty)" route="#" icon="bwi-collection" variant="tree"></nav-group>
        <nav-item title="Level 2 - no childen" route="#" icon="bwi-collection" variant="tree"></nav-item>
      </nav-group>
      <nav-item title="Level 1 - no childen" route="#" icon="bwi-collection" variant="tree"></nav-item>
    </nav-group>
  `,
});

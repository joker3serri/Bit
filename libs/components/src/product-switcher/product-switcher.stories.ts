import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { IconButtonModule, IconModule } from "@bitwarden/components";

import { I18nMockService } from "../utils/i18n-mock.service";

import { MockOrganizationService } from "./organization-mock.service";
import { ProductSwitcherModule } from "./product-switcher.module";

@Component({
  selector: "story-layout",
  template: `<product-switcher></product-switcher><ng-content></ng-content>`,
})
class StoryLayoutComponent {}

@Component({
  selector: "story-content",
  template: ``,
})
class StoryContentComponent {}

export default {
  title: "Web/Product Switcher",
  decorators: [
    moduleMetadata({
      declarations: [MockOrganizationService, StoryLayoutComponent, StoryContentComponent],
      imports: [
        RouterModule.forRoot(
          [
            {
              path: "",
              component: StoryLayoutComponent,
              children: [
                {
                  path: "",
                  redirectTo: "vault",
                  pathMatch: "full",
                },
                {
                  path: "sm/:organizationId",
                  component: StoryContentComponent,
                },
                {
                  path: "vault",
                  component: StoryContentComponent,
                },
              ],
            },
          ],
          { useHash: true }
        ),
        IconButtonModule,
        IconModule,
        ProductSwitcherModule,
      ],
      providers: [
        { provide: OrganizationService, useClass: MockOrganizationService },
        MockOrganizationService,
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              moreFromBitwarden: "More from Bitwarden",
              switchProducts: "Switch Products",
            });
          },
        },
      ],
    }),
  ],
} as Meta;

const Template: Story = (args) => ({
  props: args,
  template: `
    <router-outlet [mockOrgs]="mockOrgs"></router-outlet>
    <!-- <product-switcher></product-switcher>  -->
  `,
});

export const NoOrgs = Template.bind({});
NoOrgs.args = {
  mockOrgs: [],
};

export const OrgWithoutSecretsManager = Template.bind({});
OrgWithoutSecretsManager.args = {
  mockOrgs: [{ id: "a" }],
};

export const OrgWithSecretsManager = Template.bind({});
OrgWithSecretsManager.args = {
  mockOrgs: [{ id: "b", canAccessSecretsManager: true }],
};

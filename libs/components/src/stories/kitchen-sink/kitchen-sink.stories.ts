import { CommonModule } from "@angular/common";
import { Component, importProvidersFrom } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import {
  Meta,
  StoryObj,
  applicationConfig,
  componentWrapperDecorator,
  moduleMetadata,
} from "@storybook/angular";
import { userEvent, getAllByRole, getByRole, getByLabelText } from "@storybook/testing-library";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { AvatarModule } from "../../avatar";
import { BadgeModule } from "../../badge";
import { BannerModule } from "../../banner";
import { BreadcrumbsModule } from "../../breadcrumbs";
import { ButtonModule } from "../../button";
import { CalloutModule } from "../../callout";
import { DialogService, DialogModule } from "../../dialog";
import { IconModule } from "../../icon";
import { IconButtonModule } from "../../icon-button";
import { LayoutComponent } from "../../layout";
import { LinkModule } from "../../link";
import { NavigationModule } from "../../navigation";
import { NoItemsModule } from "../../no-items";
import { PopoverModule } from "../../popover";
import { SearchModule } from "../../search";
import { SectionComponent } from "../../section";
import { SharedModule } from "../../shared";
import { TabsModule } from "../../tabs";
import { TypographyModule } from "../../typography";
import { I18nMockService } from "../../utils/i18n-mock.service";

import { KitchenSinkForm } from "./components/kitchen-sink-form.component";
import { KitchenSinkTable } from "./components/kitchen-sink-table.component";
import { KitchenSinkToggleList } from "./components/kitchen-sink-toggle-list.component";

@Component({
  selector: "bit-tab-main",
  // TODO fix layout main scroll and get rid of this hardcoded style
  template: `<div>
    <bit-section>
      <p>
        <bit-breadcrumbs [show]="show">
          <bit-breadcrumb *ngFor="let item of navItems" [icon]="item.icon" [route]="[item.route]">
            {{ item.name }}
          </bit-breadcrumb>
        </bit-breadcrumbs>
      </p>
      <bit-banner bannerType="info"> This content is very important </bit-banner>
      <div class="tw-text-center tw-mb-6 tw-mt-6">
        <h1 bitTypography="h1" class="tw-text-main">
          Bitwarden <bit-avatar text="Bit Warden"></bit-avatar>
        </h1>
        <a bitLink linkType="primary" href="#">Learn more</a>
      </div>

      <bit-tab-group label="Main content tabs" class="tw-text-main">
        <bit-tab label="Evaluation">
          <h2 bitTypography="h2" class="tw-text-main tw-text-center tw-mt-6 tw-mb-6">About</h2>
          <bit-kitchen-sink-table></bit-kitchen-sink-table>
          <h2 bitTypography="h2" class="tw-text-main tw-text-center tw-mt-6 tw-mb-6">
            Companies using Bitwarden
          </h2>
          <bit-kitchen-sink-toggle-list></bit-kitchen-sink-toggle-list>
          <h2 bitTypography="h2" class="tw-text-main tw-text-center tw-mt-6 tw-mb-6">Survey</h2>
          <bit-kitchen-sink-form></bit-kitchen-sink-form>
        </bit-tab>
        <bit-tab label="Empty tab" data-testid="empty-tab">
          <bit-callout type="info" title="Notice"> Under construction </bit-callout>
          <bit-no-items class="tw-text-main">
            <ng-container slot="title">This tab is empty</ng-container>
            <ng-container slot="description">
              <p bitTypography="body2">Try searching for what you are looking for:</p>
              <bit-search [(ngModel)]="searchText" [placeholder]="placeholder"></bit-search>
              <p bitTypography="helper">Note that the search bar is not functional</p>
            </ng-container>
          </bit-no-items>
        </bit-tab>
      </bit-tab-group>
    </bit-section>
  </div>`,
})
class MainComponent {
  navItems = [
    { icon: "bwi-collection", name: "Password Managers", route: "/" },
    { icon: "bwi-collection", name: "Favorites", route: "/" },
  ];
}

export default {
  title: "Documentation / Kitchen Sink",
  component: LayoutComponent,
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
      declarations: [MainComponent],
      imports: [
        AvatarModule,
        BadgeModule,
        BannerModule,
        BreadcrumbsModule,
        ButtonModule,
        CommonModule,
        CalloutModule,
        DialogModule,
        FormsModule,
        IconButtonModule,
        IconModule,
        KitchenSinkForm,
        KitchenSinkTable,
        KitchenSinkToggleList,
        LayoutComponent,
        LinkModule,
        NavigationModule,
        NoItemsModule,
        PopoverModule,
        RouterModule,
        SearchModule,
        SectionComponent,
        SharedModule,
        TabsModule,
        TypographyModule,
      ],
      providers: [
        DialogService,
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              close: "Close",
              search: "Search",
              skipToContent: "Skip to content",
              submenu: "submenu",
              toggleCollapse: "toggle collapse",
            });
          },
        },
      ],
    }),
    applicationConfig({
      providers: [
        provideNoopAnimations(),
        importProvidersFrom(
          RouterModule.forRoot(
            [
              { path: "", redirectTo: "bitwarden", pathMatch: "full" },
              { path: "bitwarden", component: MainComponent },
            ],
            { useHash: true },
          ),
        ),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LayoutComponent>;

export const Default: Story = {
  render: (args) => {
    return {
      props: args,
      template: /* HTML */ `<bit-layout>
        <nav slot="sidebar">
          <bit-nav-group text="Password Managers" icon="bwi-collection" [open]="true">
            <bit-nav-group text="Favorites" icon="bwi-collection" variant="tree" [open]="true">
              <bit-nav-item text="Bitwarden" route="bitwarden"></bit-nav-item>
              <bit-nav-divider></bit-nav-divider>
            </bit-nav-group>
          </bit-nav-group>
        </nav>
        <router-outlet></router-outlet>
      </bit-layout>`,
    };
  },
};

export const MenuOpen: Story = {
  ...Default,
  play: async (context) => {
    const canvas = context.canvasElement;
    const table = getByRole(canvas, "table");

    const menuButton = getAllByRole(table, "button")[0];
    await userEvent.click(menuButton);
  },
};

export const PopoverOpen: Story = {
  ...Default,
  play: async (context) => {
    const canvas = context.canvasElement;
    const passwordLabelIcon = getByLabelText(canvas, "A random password (required)", {
      selector: "button",
    });

    await userEvent.click(passwordLabelIcon);
  },
};

export const DialogOpen: Story = {
  ...Default,
  play: async (context) => {
    const canvas = context.canvasElement;
    const submitButton = getByRole(canvas, "button", {
      name: "Submit",
    });

    await userEvent.click(submitButton);
  },
};

export const EmptyTab: Story = {
  ...Default,
  play: async (context) => {
    const canvas = context.canvasElement;
    const emptyTab = getAllByRole(canvas, "tab")[1];
    await userEvent.click(emptyTab);
  },
};

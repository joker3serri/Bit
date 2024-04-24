import { CommonModule } from "@angular/common";
import { Component, importProvidersFrom } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";

import { AvatarModule, ButtonModule, IconButtonModule } from "@bitwarden/components";

import { PopupFooterComponent } from "./popup-footer.component";
import { PopupHeaderComponent } from "./popup-header.component";
import { PopupPageComponent } from "./popup-page.component";
import { PopupTabNavigationComponent } from "./popup-tab-navigation.component";

@Component({
  selector: "vault-placeholder",
  template: `
    <div class="tw-mb-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item</div>
    <div class="tw-my-8 tw-text-main">vault item last item</div>
  `,
  standalone: true,
})
class VaultComponent {}

@Component({
  selector: "generator-placeholder",
  template: ` <div class="tw-text-main">generator stuff here</div> `,
  standalone: true,
})
class GeneratorComponent {}

@Component({
  selector: "send-placeholder",
  template: ` <div class="tw-text-main">send some stuff</div> `,
  standalone: true,
})
class SendComponent {}

@Component({
  selector: "settings-placeholder",
  template: ` <div class="tw-text-main">change your settings</div> `,
  standalone: true,
})
class SettingsComponent {}

@Component({
  selector: "mock-add-button",
  template: `
    <button bitButton buttonType="primary" type="button">
      <i class="bwi bwi-plus-f" aria-hidden="true"></i>
      Add
    </button>
  `,
  standalone: true,
  imports: [ButtonModule],
})
class MockAddButtonComponent {}

@Component({
  selector: "mock-popout-button",
  template: `
    <button
      bitIconButton="bwi-popout"
      size="small"
      type="button"
      title="Pop out"
      aria-label="Pop out"
    ></button>
  `,
  standalone: true,
  imports: [IconButtonModule],
})
class MockPopoutButtonComponent {}

@Component({
  selector: "mock-current-account",
  template: `
    <button class="tw-bg-transparent tw-border-none" type="button">
      <bit-avatar text="Ash Ketchum" size="small"></bit-avatar>
    </button>
  `,
  standalone: true,
  imports: [AvatarModule],
})
class MockCurrentAccountComponent {}

export default {
  title: "Browser/Popup Layout",
  component: PopupPageComponent,
  decorators: [
    moduleMetadata({
      imports: [
        PopupPageComponent,
        PopupHeaderComponent,
        PopupFooterComponent,
        PopupTabNavigationComponent,
        CommonModule,
        ButtonModule,
        RouterModule,
        AvatarModule,
        IconButtonModule,
        MockAddButtonComponent,
        MockPopoutButtonComponent,
        MockCurrentAccountComponent,
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(
          RouterModule.forRoot(
            [
              { path: "", redirectTo: "vault", pathMatch: "full" },
              { path: "vault", component: VaultComponent },
              { path: "generator", component: GeneratorComponent },
              { path: "send", component: SendComponent },
              { path: "settings", component: SettingsComponent },
              // in case you are coming from a story that also uses the router
              { path: "**", redirectTo: "vault" },
            ],
            { useHash: true },
          ),
        ),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<PopupPageComponent>;

export const PopupTabNavigation: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px] tw-border tw-border-solid tw-border-secondary-300">
        <popup-tab-navigation>
          <popup-page>
            <popup-header slot="header" pageTitle="Test">
              <ng-container slot="end">
                <mock-add-button></mock-add-button>
                <mock-popout-button></mock-popout-button>
                <mock-current-account></mock-current-account>
              </ng-container>
            </popup-header>
            <router-outlet></router-outlet>
          </popup-page>
        </popup-tab-navigation>
      </div>
    `,
  }),
};

export const PopupPage: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px] tw-border tw-border-solid tw-border-secondary-300">
        <popup-page>
          <popup-header showBackButton="true" slot="header" pageTitle="Test">
            <mock-popout-button slot="end"></mock-popout-button>
          </popup-header>
          <router-outlet></router-outlet>
        </popup-page>
      </div>
    `,
  }),
};

export const PopupPageWithFooter: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px] tw-border tw-border-solid tw-border-secondary-300">
        <popup-page>
          <popup-header showBackButton="true" slot="header" pageTitle="Test">
            <mock-popout-button slot="end"></mock-popout-button>
          </popup-header>
          <router-outlet></router-outlet>
          <popup-footer slot="footer">
            <div class="tw-flex tw-gap-2">
              <button bitButton buttonType="primary">Save</button>
              <button bitButton buttonType="secondary">Cancel</button>
            </div>
          </popup-footer>
        </popup-page>
      </div>
    `,
  }),
};

export const PoppedOut: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[900px] tw-border tw-border-solid tw-border-secondary-300">
        <popup-tab-navigation>
          <popup-page>
            <popup-header slot="header" pageTitle="Test">
              <ng-container slot="end">
                <mock-add-button></mock-add-button>
                <mock-current-account></mock-current-account>
              </ng-container>
            </popup-header>
            <router-outlet></router-outlet>
          </popup-page>
        </popup-tab-navigation>
      </div>
    `,
  }),
};

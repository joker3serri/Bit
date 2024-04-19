import { CommonModule } from "@angular/common";
import { Component, importProvidersFrom } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";

import { AvatarModule, ButtonModule, IconButtonModule } from "@bitwarden/components";

import { PopupBottomNavigationComponent } from "./popup-bottom-navigation.component";
import { PopupFooterComponent } from "./popup-footer.component";
import { PopupHeaderComponent } from "./popup-header.component";
import { PopupLayoutComponent } from "./popup-layout.component";

@Component({
  selector: "vault-placeholder",
  template: `
    <div class="tw-mb-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item</div>
    <div class="tw-my-8">vault item last item</div>
  `,
  standalone: true,
})
class VaultComponent {}

@Component({
  selector: "generator-placeholder",
  template: ` <div>generator stuff here</div> `,
  standalone: true,
})
class GeneratorComponent {}

@Component({
  selector: "send-placeholder",
  template: ` <div>send some stuff</div> `,
  standalone: true,
})
class SendComponent {}

@Component({
  selector: "settings-placeholder",
  template: ` <div>change your settings</div> `,
  standalone: true,
})
class SettingsComponent {}

@Component({
  selector: "mock-add-button",
  template: `
    <button bitButton buttonType="primary" type="button">
      <i class="bwi bwi-plus tw-font-bold" aria-hidden="true"></i>
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
    <button bitIconButton="bwi-external-link" size="small" type="button">Pop out</button>
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
  component: PopupLayoutComponent,
  decorators: [
    moduleMetadata({
      imports: [
        PopupLayoutComponent,
        PopupHeaderComponent,
        PopupFooterComponent,
        PopupBottomNavigationComponent,
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
            ],
            { useHash: true },
          ),
        ),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<PopupLayoutComponent>;

export const TopLevelPage: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px]">
        <popup-layout>
          <popup-header slot="popupHeader" pageTitle="Test">
            <ng-container slot="end">
              <mock-popout-button></mock-popout-button>
              <mock-current-account></mock-current-account>
            </ng-container>
          </popup-header>
          <router-outlet></router-outlet>
          <popup-bottom-navigation slot="popupFooter"></popup-bottom-navigation>
        </popup-layout>
      </div>
    `,
  }),
};

export const TopLevelWithAction: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px]">
        <popup-layout>
          <popup-header slot="popupHeader" pageTitle="Test">
            <ng-container slot="end">
              <mock-add-button></mock-add-button>
              <mock-popout-button></mock-popout-button>
              <mock-current-account></mock-current-account>
            </ng-container>
          </popup-header>
          <router-outlet></router-outlet>
          <popup-bottom-navigation slot="popupFooter"></popup-bottom-navigation>
        </popup-layout>
      </div>
    `,
  }),
};

export const SubPageWithAction: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px]">
        <popup-layout>
          <popup-header showBackButton="true" slot="popupHeader" pageTitle="Test">
            <mock-popout-button slot="end"></mock-popout-button>
          </popup-header>
          <router-outlet></router-outlet>
          <popup-footer slot="popupFooter">
            <div class="tw-flex tw-gap-2">
              <button bitButton buttonType="primary">Save</button>
              <button bitButton buttonType="secondary">Cancel</button>
            </div>
          </popup-footer>
        </popup-layout>
      </div>
    `,
  }),
};

export const SubPage: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[380px]">
        <popup-layout>
          <popup-header showBackButton="true" slot="popupHeader" pageTitle="Test">
            <mock-popout-button slot="end"></mock-popout-button>
          </popup-header>
          <router-outlet></router-outlet>
        </popup-layout>
      </div>
    `,
  }),
};

export const PoppedOut: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <div class="tw-h-[640px] tw-w-[900px]">
        <popup-layout>
          <popup-header slot="popupHeader" pageTitle="Test" poppedOut="true">
            <ng-container slot="end">
              <mock-add-button></mock-add-button>
              <mock-current-account></mock-current-account>
            </ng-container>
          </popup-header>
          <router-outlet></router-outlet>
          <popup-bottom-navigation slot="popupFooter"></popup-bottom-navigation>
        </popup-layout>
      </div>
    `,
  }),
};

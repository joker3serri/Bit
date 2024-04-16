import { CommonModule } from "@angular/common";
import { Component, importProvidersFrom } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";

import { ButtonModule } from "../button";

import {
  PopupLayoutComponent,
  PopupHeaderComponent,
  PopupFooterComponent,
  PopupBottomNavigationComponent,
} from "./popup-layout.component";

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
          <popup-header variant="top-level" popupHeader pageTitle="Test"></popup-header>
          <router-outlet></router-outlet>
          <popup-bottom-navigation popupFooter></popup-bottom-navigation>
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
          <popup-header variant="top-level-action" popupHeader pageTitle="Test"></popup-header>
          <router-outlet></router-outlet>
          <popup-bottom-navigation popupFooter></popup-bottom-navigation>
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
          <popup-header variant="sub-page" popupHeader pageTitle="Test"></popup-header>
          <router-outlet></router-outlet>
          <popup-footer popupFooter>
            <div actionFooter class="tw-flex tw-gap-2">
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
          <popup-header variant="sub-page" popupHeader pageTitle="Test"></popup-header>
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
          <popup-header
            variant="top-level-action"
            popupHeader
            pageTitle="Test"
            poppedOut="true"
          ></popup-header>
          <router-outlet></router-outlet>
          <popup-bottom-navigation popupFooter></popup-bottom-navigation>
        </popup-layout>
      </div>
    `,
  }),
};

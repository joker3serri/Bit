import { Component } from "@angular/core";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { DialogService } from "../../../../components/src/dialog/dialog.service";
import { I18nMockService } from "../../../../components/src/utils/i18n-mock.service";

import {
  UserVerificationDialogComponent,
  UserVerificationDialogParams,
  UserVerificationDialogResult,
} from "./user-verification-dialog.component";

// import { SimpleDialogOptions, DialogService } from "../..";
// import { ButtonModule } from "../../../button";
// import { CalloutModule } from "../../../callout";
// import { I18nMockService } from "../../../utils/i18n-mock.service";
// import { DialogModule } from "../../dialog.module";

@Component({
  template: `
    <div *ngFor="let scenario of dialogScenarios">
      <h2>{{ scenario.name }}</h2>
      <div class="tw-mb-4 tw-flex tw-flex-row tw-gap-2">
        <button
          *ngFor="let dialogParams of scenario.dialogParams"
          bitButton
          (click)="openSimpleConfigurableDialog(dialogParams)"
        >
          {{ dialog.title }}
        </button>
      </div>
    </div>

    <bit-callout *ngIf="showCallout" [type]="calloutType" title="Dialog Close Result">
      {{ dialogCloseResult | json }}
    </bit-callout>
  `,
})
class UserVerificationDialogStoryComponent {
  protected dialogScenarios: { name: string; dialogParams: UserVerificationDialogParams[] }[] = [
    {
      name: "Default",
      dialogParams: [{}], // TODO: verify that empty object works as the default scenario
    },
    {
      // TODO: figure out custom categories
      name: "Custom",
      dialogParams: [
        {
          title: this.i18nService.t("primaryTypeSimpleDialog"),
          bodyText: this.i18nService.t("dialogContent"),
          confirmButtonOptions: {
            text: this.i18nService.t("yes"),
            type: "primary",
          },
        },
      ],
    },
  ];

  showCallout = false;
  calloutType = "info";
  dialogCloseResult: UserVerificationDialogResult;

  constructor(
    public dialogService: DialogService,
    private i18nService: I18nService,
  ) {}

  async openUserVerificationDialog(dialogParams: UserVerificationDialogParams) {
    this.dialogCloseResult = await UserVerificationDialogComponent.open(
      this.dialogService,
      dialogParams,
    );

    this.showCallout = true;
    // TODO: update the result
    if (this.dialogCloseResult) {
      this.calloutType = "success";
    } else {
      this.calloutType = "info";
    }
  }
}

export default {
  title: "Component Library/Auth/Components/UserVerificationDialog",
  component: UserVerificationDialogStoryComponent,
  decorators: [
    moduleMetadata({
      // TODO: figure out what modules are needed. is it just 1 to 1 with the imports in the standalone comp?
      imports: [ButtonModule, DialogModule, CalloutModule],
    }),
    applicationConfig({
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            // TODO: update all translations
            return new I18nMockService({
              primaryTypeSimpleDialog: "Primary Type Simple Dialog",
              successTypeSimpleDialog: "Success Type Simple Dialog",
              infoTypeSimpleDialog: "Info Type Simple Dialog",
              warningTypeSimpleDialog: "Warning Type Simple Dialog",
              dangerTypeSimpleDialog: "Danger Type Simple Dialog",
              asyncTypeSimpleDialog: "Async",
              dialogContent: "Dialog content goes here",
              yes: "Yes",
              no: "No",
              ok: "Ok",
              cancel: "Cancel",
              accept: "Accept",
              decline: "Decline",
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      // TODO: what should this be? https://www.figma.com/file/dZ24WEE39rpn7HgSS6Dy1g/User-verification-service ?
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

type Story = StoryObj<UserVerificationDialogStoryComponent>;

export const Default: Story = {};

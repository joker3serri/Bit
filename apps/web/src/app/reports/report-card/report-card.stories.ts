import { RouterTestingModule } from "@angular/router/testing";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { StorageOptions } from "@bitwarden/common/models/domain/storageOptions";
import { BadgeModule } from "@bitwarden/components";

import { PremiumBadgeComponent } from "../../components/premium-badge.component";
import { PreloadedEnglishI18nModule } from "../../tests/preloaded-english-i18n.module";

import { ReportCardComponent, ReportTypes } from "./report-card.component";

class MockMessagingService implements MessagingService {
  send(subscriber: string, arg?: any) {
    alert("Clicked on badge");
  }
}

class MockedStateService implements Partial<StateService> {
  async getCanAccessPremium(options?: StorageOptions) {
    return false;
  }
}

export default {
  title: "Web/Reports/Card",
  component: ReportCardComponent,
  decorators: [
    moduleMetadata({
      imports: [JslibModule, BadgeModule, RouterTestingModule, PreloadedEnglishI18nModule],
      declarations: [PremiumBadgeComponent],
      providers: [
        {
          provide: MessagingService,
          useFactory: () => {
            return new MockMessagingService();
          },
        },
        {
          provide: StateService,
          useFactory: () => {
            return new MockedStateService();
          },
        },
      ],
    }),
  ],
  args: {
    type: ReportTypes.exposedPasswords,
  },
  argTypes: {
    hasPremium: { table: { disable: true } },
    click: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
  },
} as Meta;

function stateProvider({ hasPremium }: { hasPremium: boolean }) {
  return {
    provide: StateService,
    useFactory: () => {
      return {
        getCanAccessPremium: () => Promise.resolve(hasPremium),
      } as Partial<StateService>;
    },
  };
}

export const WithoutPremium: Story<ReportCardComponent> = (args: ReportCardComponent) => ({
  moduleMetadata: {
    providers: [stateProvider({ hasPremium: false })],
  },
  props: args,
});

export const WithPremium: Story<ReportCardComponent> = (args: ReportCardComponent) => ({
  moduleMetadata: {
    providers: [stateProvider({ hasPremium: true })],
  },
  props: args,
});

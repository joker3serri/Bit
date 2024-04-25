import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { of } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessageSender } from "@bitwarden/common/platform/messaging";
import { BadgeModule, I18nMockService } from "@bitwarden/components";

import { PremiumBadgeComponent } from "./premium-badge.component";

class MockMessagingService implements MessageSender {
  send = () => {
    alert("Clicked on badge");
  };
}

export default {
  title: "Web/Premium Badge",
  component: PremiumBadgeComponent,
  decorators: [
    moduleMetadata({
      imports: [JslibModule, BadgeModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              premium: "Premium",
            });
          },
        },
        {
          provide: MessageSender,
          useFactory: () => {
            return new MockMessagingService();
          },
        },
        {
          provide: BillingAccountProfileStateService,
          useValue: {
            hasPremiumFromAnySource$: of(false),
          },
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<PremiumBadgeComponent> = (args: PremiumBadgeComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};

import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { of } from "rxjs";

import { SYSTEM_THEME_OBSERVABLE } from "@bitwarden/angular/services/injection-tokens";
import { IntegrationType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { ThemeTypes } from "@bitwarden/common/platform/enums";
import { ThemeStateService } from "@bitwarden/common/platform/theming/theme-state.service";
import { I18nMockService } from "@bitwarden/components";

import { SharedModule } from "../../../shared.module";
import { IntegrationCardComponent } from "../integration-card/integration-card.component";
import { IntegrationGridComponent } from "../integration-grid/integration-grid.component";

class MockThemeService implements Partial<ThemeStateService> {}

export default {
  title: "Web/Integration Grid",
  component: IntegrationGridComponent,
  decorators: [
    moduleMetadata({
      imports: [IntegrationCardComponent, SharedModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              integrationCardAriaLabel: "Go to integration",
              integrationCardTooltip: "Go to integration",
            });
          },
        },
        {
          provide: ThemeStateService,
          useClass: MockThemeService,
        },
        {
          provide: SYSTEM_THEME_OBSERVABLE,
          useValue: of(ThemeTypes.Light),
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<IntegrationGridComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <app-integration-grid [integrations]="integrations"></app-integration-grid>
      `,
  }),
  args: {
    integrations: [
      {
        name: "Card 1",
        linkURL: "",
        image: "",
        type: IntegrationType.SSO,
      },
      {
        name: "Card 2",
        linkURL: "",
        image: "",
        type: IntegrationType.SDK,
      },
      {
        name: "Card 3",
        linkURL: "",
        image: "",
        type: IntegrationType.SCIM,
      },
    ],
  },
};

// import { action } from "@storybook/addon-actions";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { MultiSelectComponent } from "../multi-select/multi-select.component";
import { I18nMockService } from "../utils/i18n-mock.service";

import { SelectComponent } from "./select.component";
import { SelectModule } from "./select.module";

export default {
  title: "Component Library/Form/Advanced Select",
  component: SelectComponent,
  decorators: [
    moduleMetadata({
      imports: [SelectModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              // multiSelectPlaceholder: "-- Type to Filter --",
              // multiSelectLoading: "Retrieving options...",
              // multiSelectNotFound: "No items found",
              // multiSelectClearAll: "Clear all",
              // required: "required",
              // inputRequired: "Input is required.",
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/3tWtMSYoLB0ZLEimLNzYsm/End-user-%26-admin-Vault-Refresh?t=7QEmGA69YTOF8sXU-0",
    },
  },
} as Meta;

export const actionsData = {
  // onItemsConfirmed: action("onItemsConfirmed"),
};

const DefaultTemplate: Story<MultiSelectComponent> = (args: MultiSelectComponent) => ({
  props: {
    ...args,
  },
  template: `select`,
});

// export const Loading = MultiSelectTemplate.bind({});
// Loading.args = {
//   baseItems: [],
//   name: "Loading",
//   hint: "This is what a loading multi-select looks like",
//   loading: "true",
// };

// export const Disabled = DefaultTemplate.bind({});
// Disabled.args = {
//   name: "Disabled",
//   disabled: "true",
//   hint: "This is what a disabled select looks like",
// };

export const Default = DefaultTemplate.bind({});
Default.args = {};

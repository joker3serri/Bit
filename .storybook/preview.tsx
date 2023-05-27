import { setCompodocJson } from "@storybook/addon-docs/angular";
import { componentWrapperDecorator } from "@storybook/angular";
import type { Preview } from "@storybook/angular";

import docJson from "../documentation.json";
setCompodocJson(docJson);

const decorator = componentWrapperDecorator(
  (story) => `
    <ng-template #lightPreview>
    <div class="theme_light tw-px-5 tw-py-10 tw-border-2 tw-border-solid tw-border-secondary-300 tw-bg-[#ffffff]">${story}</div>
    </ng-template>
    <ng-template #darkPreview>
      <div class="theme_dark tw-mt-5 tw-px-5 tw-py-10 tw-bg-[#1f242e]">${story}</div>
    </ng-template>
    <ng-template #nordPreview>
      <div class="theme_nord tw-mt-5 tw-px-5 tw-py-10 tw-bg-[#434C5E]">${story}</div>
    </ng-template>
    <ng-template #solarizePreview>
      <div class="theme_solarize tw-mt-5 tw-px-5 tw-py-10 tw-bg-[#002b36]">${story}</div>
    </ng-template>

    <ng-container *ngTemplateOutlet="lightPreview"></ng-container>
    <ng-container *ngTemplateOutlet="darkPreview"></ng-container>
    <ng-container *ngTemplateOutlet="nordPreview"></ng-container>
    <ng-container *ngTemplateOutlet="solarizePreview"></ng-container>
  `
);

const preview: Preview = {
  decorators: [decorator],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: ["Documentation", ["Introduction", "Colors", "Icons"], "Component Library"],
      },
    },
    docs: { source: { type: "dynamic", excludeDecorators: true } },
  },
};

export default preview;

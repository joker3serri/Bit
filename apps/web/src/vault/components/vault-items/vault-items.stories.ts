import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { PreloadedEnglishI18nModule } from "../../../app/tests/preloaded-english-i18n.module";

import { VaultItemsComponent } from "./vault-items.component";
import { VaultItemsModule } from "./vault-items.module";

export default {
  title: "Web/Vault/Items",
  component: VaultItemsComponent,
  decorators: [
    moduleMetadata({
      imports: [VaultItemsModule, PreloadedEnglishI18nModule],
    }),
  ],
} as Meta;

const Template: Story<VaultItemsComponent> = (args: VaultItemsComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};

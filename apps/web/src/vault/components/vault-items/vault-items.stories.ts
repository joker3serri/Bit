import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

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
  args: {
    items: [...Array(100).keys()].map(createCipherView),
    collections: [...Array(5).keys()].map(createCollectionView),
  },
} as Meta;

const Template: Story<VaultItemsComponent> = (args: VaultItemsComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};

function createCipherView(i: number): CipherView {
  const view = new CipherView();
  view.name = `Vault item ${i}`;
  return view;
}

function createCollectionView(i: number): CollectionView {
  const view = new CollectionView();
  view.name = `Colletion ${i}`;
  return view;
}

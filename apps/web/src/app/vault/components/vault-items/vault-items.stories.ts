import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { BehaviorSubject } from "rxjs";

import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherType } from "@bitwarden/common/src/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { PreloadedEnglishI18nModule } from "../../../tests/preloaded-english-i18n.module";

import { VaultItemsComponent } from "./vault-items.component";
import { VaultItemsModule } from "./vault-items.module";

@Component({
  template: "",
})
class EmptyComponent {}

const organizations: (Organization | undefined)[] = [...new Array(5).keys()]
  .map(createOrganization)
  .concat(undefined);

export default {
  title: "Web/Vault/Items",
  component: VaultItemsComponent,
  decorators: [
    moduleMetadata({
      imports: [
        VaultItemsModule,
        PreloadedEnglishI18nModule,
        RouterModule.forRoot([{ path: "**", component: EmptyComponent }], { useHash: true }),
      ],
      providers: [
        {
          provide: EnvironmentService,
          useValue: {
            getIconsUrl() {
              return "";
            },
          } as Partial<EnvironmentService>,
        },
        {
          provide: StateService,
          useValue: {
            activeAccount$: new BehaviorSubject("1").asObservable(),
            accounts$: new BehaviorSubject({ "1": { profile: { name: "Foo" } } }).asObservable(),
            async getDisableFavicon() {
              return false;
            },
          } as Partial<StateService>,
        },
      ],
    }),
  ],
  args: {
    collections: [...Array(5).keys()].map(createCollectionView),
    ciphers: [...Array(200).keys()].map(createCipherView),
    organizations,
    showOwner: false,
    showCollections: false,
    showGroups: false,
  },
} as Meta;

const Template: Story<VaultItemsComponent> = (args: VaultItemsComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};

function createCipherView(i: number): CipherView {
  const organization = organizations[organizations.length % i];
  const view = new CipherView();
  view.id = `cipher-${i}`;
  view.name = `Vault item ${i}`;
  view.type = CipherType.Login;
  view.organizationId = organization?.id;
  return view;
}

function createCollectionView(i: number): CollectionView {
  const organization = organizations[organizations.length % i];
  const view = new CollectionView();
  view.id = `collection-${i}`;
  view.name = `Collection ${i}`;
  view.organizationId = organization?.id;
  return view;
}

function createOrganization(i: number): Organization {
  const organization = new Organization();
  organization.id = `organization-${i}`;
  organization.name = `Organization ${i}`;
  return organization;
}

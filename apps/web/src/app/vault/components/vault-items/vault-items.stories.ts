import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { BehaviorSubject } from "rxjs";

import { AvatarUpdateService } from "@bitwarden/common/abstractions/account/avatar-update.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { CipherType } from "@bitwarden/common/src/vault/enums/cipher-type";
import { LoginView } from "@bitwarden/common/src/vault/models/view/login.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import {
  CollectionAccessSelectionView,
  CollectionAdminView,
  GroupView,
} from "../../../organizations/core";
import { PreloadedEnglishI18nModule } from "../../../tests/preloaded-english-i18n.module";

import { VaultItemsComponent } from "./vault-items.component";
import { VaultItemsModule } from "./vault-items.module";

@Component({
  template: "",
})
class EmptyComponent {}

const organizations = [...new Array(3).keys()].map(createOrganization);
const groups = [...Array(3).keys()].map(createGroupView);
const collections = [...Array(5).keys()].map(createCollectionView);

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
        {
          provide: AvatarUpdateService,
          useValue: {
            async loadColorFromState() {
              return "#FF0000";
            },
          } as Partial<AvatarUpdateService>,
        },
        {
          provide: TokenService,
          useValue: {
            async getUserId() {
              return "user-id";
            },
            async getName() {
              return "name";
            },
            async getEmail() {
              return "email";
            },
          } as Partial<TokenService>,
        },
      ],
    }),
  ],
  args: {
    collections,
    allCollections: collections,
    allGroups: groups,
    ciphers: [...Array(200).keys()].map(createCipherView),
    organizations,
    showOwner: false,
    showCollections: false,
    showGroups: false,
    showPremiumFeatures: false,
    editableCollections: false,
  },
  argTypes: { onEvent: { action: "onEvent" } },
} as Meta;

const Template: Story<VaultItemsComponent> = (args: VaultItemsComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};

function createCipherView(i: number): CipherView {
  const organization = organizations[i % (organizations.length + 1)];
  const collection = collections[i % (collections.length + 1)];
  const view = new CipherView();
  view.id = `cipher-${i}`;
  view.name = `Vault item ${i}`;
  view.type = CipherType.Login;
  view.organizationId = organization?.id;
  view.login = new LoginView();
  view.login.totp = i % 2 === 0 ? "I65VU7K5ZQL7WB4E" : undefined;
  view.collectionIds = collection ? [collection.id] : [];
  return view;
}

function createCollectionView(i: number): CollectionAdminView {
  const organization = organizations[i % (organizations.length + 1)];
  const group = groups[i % (groups.length + 1)];
  const view = new CollectionAdminView();
  view.id = `collection-${i}`;
  view.name = `Collection ${i}`;
  view.organizationId = organization?.id;

  if (group !== undefined) {
    view.groups = [
      new CollectionAccessSelectionView({
        id: group.id,
        hidePasswords: false,
        readOnly: false,
      }),
    ];
  }

  return view;
}

function createGroupView(i: number): GroupView {
  const organization = organizations[i % organizations.length];
  const view = new GroupView();
  view.id = `group-${i}`;
  view.name = `Group ${i}`;
  view.organizationId = organization.id;
  return view;
}

function createOrganization(i: number): Organization {
  const organization = new Organization();
  organization.id = `organization-${i}`;
  organization.name = `Organization ${i}`;
  return organization;
}

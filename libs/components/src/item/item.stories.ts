import { Meta, StoryObj, componentWrapperDecorator, moduleMetadata } from "@storybook/angular";

import { A11yGridDirective } from "../a11y/a11y-grid.directive";
import { AvatarModule } from "../avatar";
import { BadgeModule } from "../badge";
import { IconButtonModule } from "../icon-button";
import { TypographyModule } from "../typography";

import { ItemActionComponent } from "./item-action.component";
import { ItemContentComponent } from "./item-content.component";
import { ItemGroupComponent } from "./item-group.component";
import { ItemComponent } from "./item.component";

export default {
  title: "Component Library/Item",
  component: ItemComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ItemGroupComponent,
        AvatarModule,
        IconButtonModule,
        BadgeModule,
        TypographyModule,
        ItemActionComponent,
        ItemContentComponent,
        A11yGridDirective,
      ],
    }),
    componentWrapperDecorator((story) => `<div class="tw-bg-background-alt tw-p-2">${story}</div>`),
  ],
} as Meta;

type Story = StoryObj<ItemGroupComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-item>
        <button bit-item-content>
          <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
          Foo
          <span slot="secondary">Bar</span>
        </button>

        <ng-container slot="end-actions">
          <bit-item-action>
            <button type="button" bitBadge variant="primary">Auto-fill</button>
          </bit-item-action>
          <bit-item-action>
            <button type="button" bitIconButton="bwi-clone"></button>
          </bit-item-action>
          <bit-item-action>
            <button type="button" bitIconButton="bwi-ellipsis-v"></button>
          </bit-item-action>
        </ng-container>
      </bit-item>
    `,
  }),
};

export const ContentTypes: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-item>
        <a bit-item-content href="#">
          Hi, I am a link.
        </a>
      </bit-item>
      <bit-item>
        <button bit-item-content href="#">
          And I am a button.
        </button>
      </bit-item>
      <bit-item>
        <bit-item-content>
          I'm just static :(
        </bit-item-content>
      </bit-item>
    `,
  }),
};

export const MultipleActionList: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-item-group>
        <bit-item>
          <button bit-item-content>
            <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
            Foo
            <span slot="secondary">Bar</span>
          </button>

          <ng-container slot="end-actions">
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </ng-container>
        </bit-item>
        <bit-item>
          <button bit-item-content>
            <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
            Foo
            <span slot="secondary">Bar</span>
          </button>

          <ng-container slot="end-actions">
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </ng-container>
        </bit-item>
        <bit-item>
          <button bit-item-content>
            <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
            Foo
            <span slot="secondary">Bar</span>
          </button>

          <ng-container slot="end-actions">
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </ng-container>
        </bit-item>
        <bit-item>
          <button bit-item-content>
            <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
            Foo
            <span slot="secondary">Bar</span>
          </button>

          <ng-container slot="end-actions">
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </ng-container>
        </bit-item>
        <bit-item>
          <button bit-item-content>
            <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
            Foo
            <span slot="secondary">Bar</span>
          </button>

          <ng-container slot="end-actions">
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </ng-container>
        </bit-item>
        <bit-item>
          <button bit-item-content>
            <i slot="start" class="bwi bwi-globe tw-text-3xl tw-text-muted" aria-hidden="true"></i>
            Foo
            <span slot="secondary">Bar</span>
          </button>

          <ng-container slot="end-actions">
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </ng-container>
        </bit-item>
      </bit-item-group>
    `,
  }),
};

export const SingleActionList: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-item-group>
        <bit-item>
          <a bit-item-content href="#">
            Foobar
            <i slot="end" class="bwi bwi-angle-right" aria-hidden="true"></i>
          </a>          
        </bit-item>
        <bit-item>
          <a bit-item-content href="#">
            Foobar
            <i slot="end" class="bwi bwi-angle-right" aria-hidden="true"></i>
          </a>          
        </bit-item>
        <bit-item>
          <a bit-item-content href="#">
            Foobar
            <i slot="end" class="bwi bwi-angle-right" aria-hidden="true"></i>
          </a>          
        </bit-item>
        <bit-item>
          <a bit-item-content href="#">
            Foobar
            <i slot="end" class="bwi bwi-angle-right" aria-hidden="true"></i>
          </a>          
        </bit-item>
        <bit-item>
          <a bit-item-content href="#">
            Foobar
            <i slot="end" class="bwi bwi-angle-right" aria-hidden="true"></i>
          </a>          
        </bit-item>
        <bit-item>
          <a bit-item-content href="#">
            Foobar
            <i slot="end" class="bwi bwi-angle-right" aria-hidden="true"></i>
          </a>          
        </bit-item>
      </bit-item-group>
    `,
  }),
};

import { Meta, StoryObj, componentWrapperDecorator, moduleMetadata } from "@storybook/angular";

import { AvatarModule } from "../avatar";
import { BadgeModule } from "../badge";
import { IconButtonModule } from "../icon-button";
import { TypographyModule } from "../typography";

import { ItemActionComponent } from "./item-action.component";
import { ItemComponent } from "./item.component";
import { ListComponent } from "./list.component";

export default {
  title: "Component Library/List",
  component: ListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ItemComponent,
        AvatarModule,
        IconButtonModule,
        BadgeModule,
        TypographyModule,
        ItemActionComponent,
      ],
    }),
    componentWrapperDecorator((story) => `<div class="tw-bg-background-alt tw-p-2">${story}</div>`),
  ],
} as Meta;

type Story = StoryObj<ListComponent>;

export const StandaloneItem: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-item iconEnd="bwi-angle-right">
        Foo
      </bit-item>
    `,
  }),
};

export const CustomContent: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
      <bit-item iconEnd="bwi-lock">
        <bit-avatar slot="start" size="small" text="Baz"></bit-avatar>
        <div class="tw-flex tw-flex-col tw-items-start">
          <span>baz@bitwarden.com</span>
          <span bitTypography="helper" class="tw-text-muted">bitwarden.com</span>
          <span bitTypography="helper" class="tw-text-muted"><em>locked</em></span>
        </div>
      </bit-item>
    `,
  }),
};

export const SingleActionList: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
        <bit-list>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
          <bit-item iconEnd="bwi-angle-right">
            Foo
          </bit-item>
        </bit-list>
    `,
  }),
};

export const MultiActionList: Story = {
  render: (args) => ({
    props: args,
    template: /*html*/ `
        <bit-list>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
          <bit-item iconStart="bwi-globe">
            Bar
            <bit-item-action>
              <button type="button" bitBadge variant="primary">Auto-fill</button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-clone"></button>
            </bit-item-action>
            <bit-item-action>
              <button type="button" bitIconButton="bwi-ellipsis-v"></button>
            </bit-item-action>
          </bit-item>
        </bit-list>
    `,
  }),
};

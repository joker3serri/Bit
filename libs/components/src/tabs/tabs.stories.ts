import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { TabGroupComponent } from "./tab-group.component";
import { TabsModule } from "./tabs.module";

@Component({
  selector: "bit-tab-active-dummy",
  template: "Router - Active selected",
})
class ActiveDummyComponent {}

@Component({
  selector: "bit-tab-item-2-dummy",
  template: "Router - Item 2 selected",
})
class ItemTwoDummyComponent {}

@Component({
  selector: "bit-tab-item-3-dummy",
  template: "Router - Item 3 selected",
})
class ItemThreeDummyComponent {}

@Component({
  selector: "bit-tab-disabled-dummy",
  template: "Router - Disabled selected",
})
class DisabledDummyComponent {}

@Component({
  selector: "add-tab-example",
  template: ` <bit-tab-group label="thing">
      <bit-tab *ngFor="let t of tabs" [label]="'Tab ' + t">Tab Content {{ t }}</bit-tab>
    </bit-tab-group>
    <button (click)="addTab()">Add Tab</button>
    <button (click)="removeTab()">Remove Tab</button>`,
})
class AddTabComponent {
  tabs = [1, 2, 3];

  addTab() {
    this.tabs.push(this.tabs.length + 1);
  }

  removeTab() {
    this.tabs.pop();
  }
}

export default {
  title: "Component Library/Tabs",
  component: TabGroupComponent,
  decorators: [
    moduleMetadata({
      declarations: [
        ActiveDummyComponent,
        ItemTwoDummyComponent,
        ItemThreeDummyComponent,
        DisabledDummyComponent,
        AddTabComponent,
      ],
      imports: [
        CommonModule,
        TabsModule,
        RouterModule.forRoot(
          [
            { path: "", redirectTo: "active", pathMatch: "full" },
            { path: "active", component: ActiveDummyComponent },
            { path: "item-2", component: ItemTwoDummyComponent },
            { path: "item-3", component: ItemThreeDummyComponent },
            { path: "disabled", component: DisabledDummyComponent },
          ],
          { useHash: true }
        ),
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A17922",
    },
  },
} as Meta;

// const NavTabGroupTemplate: Story<TabGroupComponent> = (args: TabGroupComponent) => ({
//   props: args,
//   template: `
//     <bit-tab-group>
//       <bit-tab [route]="['active']" label="Active"></bit-tab>
//       <bit-tab [route]="['item-2']" label="Item 2"></bit-tab>
//       <bit-tab [route]="['item-3']" label="Item 3"></bit-tab>
//       <bit-tab [route]="['disabled']" [disabled]="true" label="Disabled"></bit-tab>
//     </bit-tab-group>
//     <div class="tw-bg-transparent tw-text-semibold tw-text-center tw-text-main tw-py-10">
//       <router-outlet></router-outlet>
//     </div>
//   `,
// });

const NavTabGroupTemplate: Story<TabGroupComponent> = (args: TabGroupComponent) => ({
  props: args,
  template: `
    <bit-tab-nav-bar label="Main">
      <bit-tab-link [route]="['active']">Active</bit-tab-link>
      <bit-tab-link [route]="['item-2']">Item 2</bit-tab-link>
      <bit-tab-link [route]="['item-3']">Item 3</bit-tab-link>
      <bit-tab-link [route]="['disable']" [disabled]="true">Disabled</bit-tab-link>
    </bit-tab-nav-bar>
    <div class="tw-bg-transparent tw-text-semibold tw-text-center tw-text-main tw-py-10">
      <router-outlet></router-outlet>
    </div>
  `,
});

export const NavigationTabs = NavTabGroupTemplate.bind({});

const ContentTabGroupTemplate: Story<TabGroupComponent> = (args: any) => ({
  props: args,
  template: `<add-tab-example></add-tab-example>`,
  // template: `
  //   <bit-tab-group>
  //     <bit-tab *ngFor="let t of [${args.tabs}]" [label]="'Tab ' + t">Tab Content {{t}}</bit-tab>
  //   </bit-tab-group>
  //   <button (click)="() => args.tabs.push">Add Tab</button>
  // `,
});

export const ContentTabs = ContentTabGroupTemplate.bind({});

ContentTabs.args = {
  tabs: [1, 2, 3],
  index: 0,
};

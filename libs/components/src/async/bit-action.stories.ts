import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../button";

import { BitActionDirective } from "./bit-action.directive";

export default {
  title: "Component Library/Async/Action",
  component: BitActionDirective,
  decorators: [
    moduleMetadata({
      declarations: [BitActionDirective],
      imports: [ButtonModule],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<BitActionDirective> = (args: BitActionDirective) => ({
  template: `<button bitButton buttonType="primary" [bitAction]="action">Perform action</button>`,
});

export const UsingPromise = Template.bind({});
UsingPromise.props = {
  action: () => undefined,
  // action: () => console.log("hej"),
};

// const ObservableTemplate: Story<PromiseExampleComponent> = (args: PromiseExampleComponent) => ({
//   template: `<app-observable-example></app-observable-example>`,
// });

// export const UsingObservable = ObservableTemplate.bind({});
// UsingPromise.props = {};

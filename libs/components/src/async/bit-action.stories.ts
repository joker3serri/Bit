import { Component } from "@angular/core";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { delay, of } from "rxjs";

import { ButtonModule } from "../button";

import { BitActionDirective } from "./bit-action.directive";

@Component({
  template: `<button bitButton buttonType="primary" [bitAction]="action">Perform action</button>`,
  selector: "app-promise-example",
})
class PromiseExampleComponent {
  action = async () => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(resolve, 2000);
    });
  };
}

@Component({
  template: `<button bitButton buttonType="primary" [bitAction]="action">Perform action</button>`,
  selector: "app-observable-example",
})
class ObservableExampleComponent {
  action = () => {
    return of("fake observable").pipe(delay(2000));
  };
}

export default {
  title: "Component Library/Async/Action",
  decorators: [
    moduleMetadata({
      declarations: [BitActionDirective, PromiseExampleComponent, ObservableExampleComponent],
      imports: [ButtonModule],
      providers: [],
    }),
  ],
} as Meta;

const PromiseTemplate: Story<PromiseExampleComponent> = (args: PromiseExampleComponent) => ({
  props: args,
  template: `<app-promise-example></app-promise-example>`,
});

export const UsingPromise = PromiseTemplate.bind({});

const ObservableTemplate: Story<ObservableExampleComponent> = (
  args: ObservableExampleComponent
) => ({
  template: `<app-observable-example></app-observable-example>`,
});

export const UsingObservable = ObservableTemplate.bind({});

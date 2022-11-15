import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { CheckboxComponent } from "./checkbox.component";
import { CheckboxModule } from "./checkbox.module";

const template = `
  <form [formGroup]="formObj">
    <bit-checkbox>Click me</bit-checkbox>
  </form>`;

@Component({
  selector: "app-example",
  template,
})
class ExampleComponent {
  protected formObj = this.formBuilder.group({
    checkbox: [""],
  });

  constructor(private formBuilder: FormBuilder) {}
}

export default {
  title: "Component Library/Form/Checkbox",
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      declarations: [ExampleComponent],
      imports: [FormsModule, ReactiveFormsModule, CheckboxModule],
      providers: [],
    }),
  ],
} as Meta;

const DefaultTemplate: Story<ExampleComponent> = (args: ExampleComponent) => ({
  props: args,
  template: `<app-example></app-example>`,
});

export const Default = DefaultTemplate.bind({});

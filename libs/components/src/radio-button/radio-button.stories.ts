import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { RadioButtonModule } from "./radio-button.module";

const template = `
  <form [formGroup]="formObj">
    <bit-radio-group>
      <bit-radio-button></bit-radio-button>
    </bit-radio-group>
  </form>`;

enum TestValue {
  First,
  Second,
  Third,
}

@Component({
  selector: "app-example",
  template,
})
class ExampleComponent {
  protected TestValue = TestValue;

  protected formObj = this.formBuilder.group({
    value: TestValue.First,
  });

  @Input() set selected(value: TestValue) {
    this.formObj.patchValue({ value });
  }

  @Input() set disabled(disable: boolean) {
    if (disable) {
      this.formObj.disable();
    } else {
      this.formObj.enable();
    }
  }

  constructor(private formBuilder: FormBuilder) {}
}

export default {
  title: "Component Library/Form/Radio Button",
  component: ExampleComponent,
  decorators: [
    moduleMetadata({
      declarations: [ExampleComponent],
      imports: [FormsModule, ReactiveFormsModule, RadioButtonModule],
      providers: [],
    }),
  ],
  args: {
    selected: TestValue.First,
    disabled: false,
  },
} as Meta;

const DefaultTemplate: Story<ExampleComponent> = (args: ExampleComponent) => ({
  props: args,
  template: `<app-example [selected]="selected" [disabled]="disabled"></app-example>`,
});

export const Default = DefaultTemplate.bind({});

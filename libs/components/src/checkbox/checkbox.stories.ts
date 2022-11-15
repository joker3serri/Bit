import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { CheckboxComponent } from "./checkbox.component";
import { CheckboxModule } from "./checkbox.module";

const template = `
  <form [formGroup]="formObj">
    <bit-checkbox formControlName="checkbox">Click me</bit-checkbox>
  </form>`;

@Component({
  selector: "app-example",
  template,
})
class ExampleComponent {
  protected formObj = this.formBuilder.group({
    checkbox: false,
  });

  @Input() set checked(value: boolean) {
    this.formObj.patchValue({ checkbox: value });
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
  title: "Component Library/Form/Checkbox",
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      declarations: [ExampleComponent],
      imports: [FormsModule, ReactiveFormsModule, CheckboxModule],
      providers: [],
    }),
  ],
  args: {
    checked: false,
    disabled: false,
  },
} as Meta;

const DefaultTemplate: Story<ExampleComponent> = (args: ExampleComponent) => ({
  props: args,
  template: `<app-example [checked]="checked" [disabled]="disabled"></app-example>`,
});

export const Default = DefaultTemplate.bind({});

import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ButtonComponent, ButtonModule } from "../button";
import { InputModule } from "../input/input.module";

import { BitFormFieldComponent } from "./form-field.component";
import { FormFieldModule } from "./form-field.module";
import { BitPasswordInputToggleDirective } from "./password-input-toggle.directive";

@Component({
  selector: "test-form-field",
  template: `
    <form>
      <bit-form-field>
        <bit-label>Password</bit-label>
        <input bitInput type="password" />
        <button type="button" bitButton bitSuffix bitPasswordInputToggle></button>
      </bit-form-field>
    </form>
  `,
})
class TestFormFieldComponent {}

describe("BannerComponent", () => {
  let fixture: ComponentFixture<TestFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldModule, ButtonModule, InputModule],
      declarations: [TestFormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormFieldComponent);
    fixture.detectChanges();
  });

  it("changes icon on click", () => {
    const toggle = fixture.debugElement.query(By.directive(BitPasswordInputToggleDirective));
    const buttonEl = fixture.debugElement.query(By.directive(ButtonComponent));
    const button: ButtonComponent = buttonEl.componentInstance;

    expect(button.icon).toBe("bwi-eye");

    toggle.triggerEventHandler("click");

    expect(button.icon).toBe("bwi-eye-slash");
  });

  it("input changes type on click", () => {
    const toggle = fixture.debugElement.query(By.directive(BitPasswordInputToggleDirective));
    const formFieldEl = fixture.debugElement.query(By.directive(BitFormFieldComponent));
    const formField: BitFormFieldComponent = formFieldEl.componentInstance;
    const input = formField.input;

    expect(input.type).toBe("password");

    toggle.triggerEventHandler("click");

    expect(input.type).toBe("text");
  });

  it("input has spellCheck false when toggled", () => {
    const toggle = fixture.debugElement.query(By.directive(BitPasswordInputToggleDirective));
    const formFieldEl = fixture.debugElement.query(By.directive(BitFormFieldComponent));
    const formField: BitFormFieldComponent = formFieldEl.componentInstance;
    const input = formField.input;

    expect(input.spellcheck).toBe(undefined);

    toggle.triggerEventHandler("click");

    expect(input.spellcheck).toBe(false);

    toggle.triggerEventHandler("click");

    expect(input.spellcheck).toBe(undefined);
  });
});

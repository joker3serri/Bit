import { Component } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { ToggleGroupElementComponent } from "./toggle-group-button.component";
import { ButtonGroupModule } from "./toggle-group.module";

describe("Button", () => {
  let fixture: ComponentFixture<TestApp>;
  let testAppComponent: TestApp;
  let buttonElements: ToggleGroupElementComponent[];
  let radioButtons: HTMLInputElement[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ButtonGroupModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(TestApp);
    testAppComponent = fixture.debugElement.componentInstance;
    buttonElements = fixture.debugElement
      .queryAll(By.css("bit-toggle-group-button"))
      .map((e) => e.componentInstance);
    radioButtons = fixture.debugElement
      .queryAll(By.css("input[type=radio]"))
      .map((e) => e.nativeElement);

    fixture.detectChanges();
  }));

  it("should select second element when setting selected to second", () => {
    testAppComponent.selected = "second";
    fixture.detectChanges();

    expect(buttonElements[1].selected).toBe(true);
  });

  it("should not select second element when setting selected to third", () => {
    testAppComponent.selected = "third";
    fixture.detectChanges();

    expect(buttonElements[1].selected).toBe(false);
  });

  it("should emit new value when changing selection by clicking on radio button", () => {
    testAppComponent.selected = "first";
    fixture.detectChanges();

    radioButtons[1].click();

    expect(testAppComponent.selected).toBe("second");
  });
});

@Component({
  selector: "test-app",
  template: `
    <bit-toggle-group [(selected)]="selected">
      <bit-toggle-group-button value="first">First</bit-toggle-group-button>
      <bit-toggle-group-button value="second">Second</bit-toggle-group-button>
      <bit-toggle-group-button value="third">Third</bit-toggle-group-button>
    </bit-toggle-group>
  `,
})
class TestApp {
  selected?: string;
}

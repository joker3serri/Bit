import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { LinkModule } from "./index";

describe("Links", () => {
  let fixture: ComponentFixture<TestApp>;
  let testAppComponent: TestApp;
  let buttonDebugElement: DebugElement;
  let anchorDebugElement: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LinkModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(TestApp);
    testAppComponent = fixture.debugElement.componentInstance;
    buttonDebugElement = fixture.debugElement.query(By.css("button"));
    anchorDebugElement = fixture.debugElement.query(By.css("a"));
  }));

  it("should apply classes based on type", () => {
    testAppComponent.linkType = "primary";
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains("tw-text-primary-500")).toBe(true);
    expect(anchorDebugElement.nativeElement.classList.contains("tw-text-primary-500")).toBe(true);

    testAppComponent.linkType = "secondary";
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains("tw-text-main")).toBe(true);
    expect(anchorDebugElement.nativeElement.classList.contains("tw-text-main")).toBe(true);

    testAppComponent.linkType = "contrast";
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains("tw-text-contrast")).toBe(true);
    expect(anchorDebugElement.nativeElement.classList.contains("tw-text-contrast")).toBe(true);

    testAppComponent.linkType = null;
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains("tw-text-primary-500")).toBe(true);
    expect(anchorDebugElement.nativeElement.classList.contains("tw-text-primary-500")).toBe(true);
  });
});

@Component({
  selector: "test-app",
  template: `
    <button bitLink [linkType]="linkType" class="tw-mb-2 tw-block">Button</button>
    <a bitLink [linkType]="linkType" href="#" class="tw-mb-2 tw-block">Anchor</a>
  `,
})
class TestApp {
  linkType: string;
}

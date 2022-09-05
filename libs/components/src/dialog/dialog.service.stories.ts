import { DialogModule, DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../button";

import { DialogCloseDirective } from "./dialog-close.directive";
import { DialogTitleDirective } from "./dialog-title.directive";
import { DialogService } from "./dialog.service";
import { DialogComponent } from "./dialog/dialog.component";

interface Animal {
  animal: string;
}

@Component({
  selector: "app-story-dialog",
  template: `<button bitButton (click)="openDialog()">Open Dialog</button>`,
})
class StoryDialogComponent {
  constructor(public dialogService: DialogService) {}

  openDialog() {
    this.dialogService.open(StoryDialogContentComponent, {
      data: {
        animal: "panda",
      },
    });
  }
}

@Component({
  selector: "story-dialog-content",
  template: `
    <bit-dialog [dialogSize]="large">
      <h2 bitDialogTitle>Dialog Title</h2>
      <span bitDialogContent>
        Dialog body text goes here.
        <br />
        Animal: {{ animal }}
      </span>
      <div bitDialogFooter class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary" (click)="dialogRef.close()">Save</button>
        <button bitButton buttonType="secondary" bitDialogClose>Cancel</button>
      </div>
    </bit-dialog>
  `,
})
class StoryDialogContentComponent {
  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) private data: Animal) {}

  get animal() {
    return this.data?.animal;
  }
}

export default {
  title: "Component Library/Dialogs/Service",
  component: StoryDialogComponent,
  decorators: [
    moduleMetadata({
      declarations: [
        DialogCloseDirective,
        DialogComponent,
        DialogTitleDirective,
        StoryDialogContentComponent,
      ],
      imports: [ButtonModule, DialogModule],
      providers: [DialogService],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

const Template: Story<StoryDialogComponent> = (args: StoryDialogComponent) => ({
  props: args,
});

export const Default = Template.bind({});

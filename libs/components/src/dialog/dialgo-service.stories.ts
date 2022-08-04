import { DialogModule, DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../button";

import { ModalCloseDirective } from "./dialog-content.directives";
import { ModalComponent } from "./dialog.component";
import { DialogService } from "./dialog.service";

interface Animal {
  animal: string;
}

@Component({
  selector: "app-story-modal",
  template: `<button bitButton (click)="openDialog()">Open Dialog</button>`,
})
class StoryModalComponent {
  constructor(public dialogService: DialogService) {}

  openDialog() {
    this.dialogService.open(StoryModalContentComponent, {
      data: {
        animal: "panda",
      },
    });
  }
}

@Component({
  selector: "story-modal-content",
  template: `
    <bit-modal [modalSize]="large">
      <span bit-modal-title>Modal Title</span>
      <span bit-modal-content>
        Modal body text goes here.
        <br />
        Animal: {{ animal }}
      </span>
      <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary" (click)="dialogRef.close()">Save</button>
        <button bitButton buttonType="secondary" bitModalClose>Cancel</button>
      </div>
    </bit-modal>
  `,
})
class StoryModalContentComponent {
  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) private data: Animal) {}

  get animal() {
    return this.data?.animal;
  }
}

export default {
  title: "Component Library/Dialogs/Service",
  component: StoryModalComponent,
  decorators: [
    moduleMetadata({
      declarations: [ModalComponent, StoryModalContentComponent, ModalCloseDirective],
      imports: [ButtonModule, DialogModule],
      providers: [DialogService],
    }),
  ],
  args: {
    modalSize: "small",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

const Template: Story<StoryModalComponent> = (args: StoryModalComponent) => ({
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  modalSize: "default",
};

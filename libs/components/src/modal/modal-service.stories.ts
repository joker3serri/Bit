import { DialogModule, DialogRef } from "@angular/cdk/dialog";
import { Component } from "@angular/core";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../button";

import { ModalCloseDirective } from "./modal-content.directives";
import { ModalComponent } from "./modal.component";
import { DialogService } from "./modal.service";

@Component({
  selector: "app-story-modal",
  template: `<button bitButton (click)="openDialog()">Open Dialog</button>`,
})
class StoryModalComponent {
  constructor(public dialogService: DialogService) {}

  openDialog() {
    this.dialogService.open(StoryModalContentComponent, {
      minWidth: "300px",
      data: {
        animal: "panda",
      },
    });
  }
}

@Component({
  selector: "story-modal-content",
  template: `
    <bit-modal>
      <span bit-modal-title> Modal Title </span>
      <span bit-modal-content> Modal body text goes here. </span>
      <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary" (click)="dialogRef.close()">Save</button>
        <button bitButton buttonType="secondary" bitModalClose>Cancel</button>
      </div>
    </bit-modal>
  `,
})
class StoryModalContentComponent {
  constructor(public dialogRef: DialogRef) {}
}

export default {
  title: "Component Library/Modals/Service",
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

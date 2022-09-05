import { CdkDialogContainer, DialogRef } from "@angular/cdk/dialog";
import { Directive, HostBinding, Input, OnInit, Optional } from "@angular/core";

// Increments for each instance of this component
let nextId = 0;

@Directive({
  selector: "[bitDialogTitle]",
})
export class DialogTitleDirective implements OnInit {
  @HostBinding("class") get classList() {
    return ["tw-mb-0", "tw-grow", "tw-text-lg", "tw-uppercase"];
  }
  @HostBinding("id") id = `bit-dialog-title-${nextId++}`;

  @Input("bitDialogClose") dialogResult: any;

  constructor(@Optional() private dialogRef: DialogRef<any>) {}

  ngOnInit(): void {
    // Based on angular/components, licensed under MIT
    // https://github.com/angular/components/blob/14.2.0/src/material/dialog/dialog-content-directives.ts#L121-L128
    if (this.dialogRef) {
      Promise.resolve().then(() => {
        const container = this.dialogRef.containerInstance as CdkDialogContainer;

        if (container && !container._ariaLabelledBy) {
          container._ariaLabelledBy = this.id;
        }
      });
    }
  }
}

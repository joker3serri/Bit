import { DialogRef } from "@angular/cdk/dialog";
import { Directive, HostBinding, Input, Optional } from "@angular/core";

@Directive({
  selector: "[bitDialogClose]",
})
export class DialogCloseDirective {
  @Input("bit-dialog-close") dialogResult: any;

  constructor(@Optional() public dialogRef: DialogRef<any>) {}

  @HostBinding() close() {
    this.dialogRef.close(this.dialogResult);
  }
}

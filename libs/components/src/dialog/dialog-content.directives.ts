import { DialogRef } from "@angular/cdk/dialog";
import { Directive, Input, Optional } from "@angular/core";

@Directive({
  selector: "[bitModalClose]",
  host: {
    "(click)": "_onButtonClick()",
  },
})
export class ModalCloseDirective {
  @Input("bit-modal-close") modalResult: any;

  constructor(@Optional() public dialogRef: DialogRef<any>) {}

  _onButtonClick() {
    this.dialogRef.close(this.modalResult);
  }
}

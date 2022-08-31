import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "sm-header",
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  @Input() title: string;
  @Input() searchTitle: string;
  @Output() createSecretEvent = new EventEmitter<string>();

  onCreateSecret(event: string) {
    this.createSecretEvent.emit(event);
  }
}

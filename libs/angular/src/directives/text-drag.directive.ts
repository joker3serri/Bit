import { Directive, HostListener, Input } from "@angular/core";

@Directive({
  selector: "[appTextDrag]",
  standalone: true,
  host: {
    draggable: "true",
    class: "tw-cursor-move",
  },
})
export class TextDragDirective {
  @Input({
    alias: "appTextDrag",
    required: true,
  })
  @Input()
  data: string | null = "";

  @HostListener("dragstart", ["$event"])
  onDragStart(event: DragEvent) {
    if (this.data === null || this.data === undefined) {
      this.data = "";
    }

    event.dataTransfer?.setData("text", this.data);
  }
}

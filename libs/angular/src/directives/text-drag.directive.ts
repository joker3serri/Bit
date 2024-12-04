import { Directive, HostListener, Input } from "@angular/core";

export
@Directive({
  selector: "[appTextDrag]",
  standalone: true,
  host: {
    draggable: "true",
    class: "tw-cursor-move",
  },
})
class TextDragDirective {
  @Input({
    alias: "appTextDrag",
    required: true,
  })
  data = "";

  @HostListener("dragstart", ["$event"])
  onDragStart(event: DragEvent) {
    event.dataTransfer.setData("text", this.data);
  }
}

import { Component, OnInit } from "@angular/core";

@Component({
  selector: "bit-layout",
  templateUrl: "layout.component.html",
  standalone: true,
  imports: [],
})
export class LayoutComponent implements OnInit {
  ngOnInit() {
    document.body.classList.remove("layout_frontend");
  }
}

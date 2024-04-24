import {
  AfterViewInit,
  ContentChildren,
  Directive,
  HostBinding,
  HostListener,
  QueryList,
} from "@angular/core";

import type { A11yCellDirective } from "./a11y-cell.directive";
import { A11yRowDirective } from "./a11y-row.directive";

@Directive({
  selector: "bitA11yGrid",
  standalone: true,
})
export class A11yGridDirective implements AfterViewInit {
  @ContentChildren(A11yRowDirective)
  rows: QueryList<A11yRowDirective>;

  @HostBinding("attr.role")
  role = "grid";

  private grid: A11yCellDirective[][];
  private activeRow: number = 0;
  private activeCol: number = 0;

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case "ArrowUp":
        this.updateCellFocusByDelta(0, -1);
        break;
      case "ArrowRight":
        this.updateCellFocusByDelta(1, 0);
        break;
      case "ArrowDown":
        this.updateCellFocusByDelta(0, 1);
        break;
      case "ArrowLeft":
        this.updateCellFocusByDelta(-1, 0);
        break;
      case "Home":
        this.updateCellFocusByDelta(-this.activeCol, -this.activeRow);
        break;
      case "End":
        this.updateCellFocusByDelta(this.grid[this.grid.length - 1].length, this.grid.length);
        break;
      case "PageUp":
        this.updateCellFocusByDelta(0, -5);
        break;
      case "PageDown":
        this.updateCellFocusByDelta(0, 5);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  ngAfterViewInit(): void {
    this.grid = this.rows.map((listItem) => [...listItem.cells]);
    this.grid.flat().map((cell) => (cell.focusableChild.getFocusTarget().tabIndex = -1));

    const firstCell = this.getActiveCellContent();
    firstCell.tabIndex = 0;
  }

  private getActiveCellContent(): HTMLElement {
    return this.grid[this.activeRow][this.activeCol].focusableChild.getFocusTarget();
  }

  private updateCellFocusByDelta(colDelta: number, rowDelta: number) {
    const prevActive = this.getActiveCellContent();

    this.activeCol += colDelta;
    this.activeRow += rowDelta;

    if (this.activeRow >= this.grid.length) {
      this.activeRow = this.grid.length - 1;
    }

    if (this.activeRow < 0) {
      this.activeRow = 0;
    }

    if (this.activeCol >= this.grid[this.activeRow].length) {
      if (this.activeRow < this.grid.length - 1) {
        this.activeCol = 0;
        this.activeRow += 1;
      } else {
        this.activeCol = this.grid[this.activeRow].length - 1;
      }
    }

    if (this.activeCol < 0) {
      if (this.activeRow > 0) {
        this.activeRow -= 1;
        this.activeCol = this.grid[this.activeRow].length - 1;
      } else {
        this.activeCol = 0;
      }
    }

    const nextActive = this.getActiveCellContent();
    nextActive.tabIndex = 0;
    nextActive.focus();

    if (nextActive !== prevActive) {
      prevActive.tabIndex = -1;
    }
  }
}

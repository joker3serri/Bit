import { Component } from "@angular/core";

import { IconButtonModule } from "../../../icon-button";
import { MenuModule } from "../../../menu";
import { TableModule } from "../../../table";

@Component({
  standalone: true,
  selector: "bit-kitchen-sink-table",
  imports: [IconButtonModule, MenuModule, TableModule],
  template: `<bit-table>
    <ng-container header>
      <tr>
        <th bitCell>Product</th>
        <th bitCell>User</th>
        <th bitCell>Options</th>
      </tr>
    </ng-container>
    <ng-template body>
      <tr bitRow>
        <td bitCell>Password Manager</td>
        <td bitCell>Everyone</td>
        <td bitCell>
          <button
            bitIconButton="bwi-ellipsis-v"
            [bitMenuTriggerFor]="menu1"
            appA11yTitle="options"
          ></button>
          <bit-menu #menu1>
            <a href="#" bitMenuItem>Anchor link</a>
            <a href="#" bitMenuItem>Another link</a>
            <bit-menu-divider></bit-menu-divider>
            <button type="button" bitMenuItem>Button after divider</button>
          </bit-menu>
        </td>
      </tr>
      <tr bitRow>
        <td bitCell>Secrets Manager</td>
        <td bitCell>Developers</td>
        <td bitCell>
          <button
            bitIconButton="bwi-ellipsis-v"
            [bitMenuTriggerFor]="menu2"
            appA11yTitle="options"
          ></button>
          <bit-menu #menu2>
            <a href="#" bitMenuItem>Anchor link</a>
            <a href="#" bitMenuItem>Another link</a>
            <bit-menu-divider></bit-menu-divider>
            <button type="button" bitMenuItem>Button after divider</button>
          </bit-menu>
        </td>
      </tr>
    </ng-template>
  </bit-table>`,
})
export class KitchenSinkTable {}

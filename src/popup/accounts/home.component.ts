import { Component } from '@angular/core';
import { BrowserApi } from '../../browser/browserApi';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
})
export class HomeComponent {

    openCozyWebsite() {
        BrowserApi.createNewTab("https://cozy.io");
    }
 }

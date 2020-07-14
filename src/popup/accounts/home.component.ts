import { Component } from '@angular/core';
import { BrowserApi } from '../../browser/browserApi';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
})
export class HomeComponent {

    openCozyWebsite() {
        BrowserApi.createNewTab('https://manager.cozycloud.cc/cozy/create');
    }
 }

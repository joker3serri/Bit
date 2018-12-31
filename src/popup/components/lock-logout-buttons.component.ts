import {
    Component,
} from '@angular/core';

import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

@Component({
    selector: 'app-lock-logout',
    templateUrl: 'lock-logout-buttons.component.html',
})
export class LockLogoutComponent {
    constructor(private platformUtilsService: PlatformUtilsService, private analytics: Angulartics2,
        private i18nService: I18nService, private router: Router,
        private lockService: LockService, private messagingService: MessagingService) { }

    async lock() {
        this.analytics.eventTrack.next({ action: 'Lock Now from header' });
        await this.lockService.lock();
        this.router.navigate(['lock']);
    }

    async logOut() {
        this.analytics.eventTrack.next({ action: 'Logout from header' });
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('logOutConfirmation'), this.i18nService.t('logOut'),
            this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            this.messagingService.send('logout');
        }
    }
}

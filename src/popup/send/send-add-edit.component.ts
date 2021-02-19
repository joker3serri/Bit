import {
    DatePipe,
    Location,
} from '@angular/common';

import { Component } from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PopupUtilsService } from '../services/popup-utils.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/send/add-edit.component';

@Component({
    selector: 'app-send-add-edit',
    templateUrl: 'send-add-edit.component.html',
})
export class SendAddEditComponent extends BaseAddEditComponent {
    showAttachments = true;
    showOptions = false;
    openAttachmentsInPopup: boolean;

    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        userService: UserService, messagingService: MessagingService, policyService: PolicyService,
        environmentService: EnvironmentService, datePipe: DatePipe, sendService: SendService,
        private route: ActivatedRoute, private router: Router, private location: Location,
        private popupUtilsService: PopupUtilsService) {
        super(i18nService, platformUtilsService, environmentService, datePipe, sendService, userService,
            messagingService, policyService);
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async (params) => {
            if (params.sendId) {
                this.sendId = params.sendId;
            }
            if (params.type) {
                const type = parseInt(params.type, null);
                this.type = type;
            }
            await this.load();

            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }

            this.openAttachmentsInPopup = this.popupUtilsService.inPopup(window);
        });

        window.setTimeout(() => {
            if (!this.editMode) {
                document.getElementById('name').focus();
            }
        }, 200);
    }

    async submit(): Promise<boolean> {
        if (await super.submit()) {
            this.cancel();
            return true;
        }

        return false;
    }

    async delete(): Promise<boolean> {
        if (await super.delete()) {
            this.cancel();
            return true;
        }

        return false;
    }

    cancel() {
        this.location.back();
    }
}

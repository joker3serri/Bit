import {
    Component,
    Input
} from '@angular/core';

import {
    AddEditCustomFieldsComponent as BaseAddEditCustomFieldsComponent
} from 'jslib-angular/components/add-edit-custom-fields.component';

import { I18nService } from 'jslib-common/abstractions';
import { EventService } from 'jslib-common/abstractions/event.service';

import { CipherView } from 'jslib-common/models/view';

@Component({
    selector: 'app-vault-add-edit-custom-fields',
    templateUrl: 'add-edit-custom-fields.component.html',
})
export class AddEditCustomFieldsComponent extends BaseAddEditCustomFieldsComponent {
    @Input() cipher: CipherView;

    constructor(i18nService: I18nService, eventService: EventService) {
        super(i18nService, eventService);
    }
}

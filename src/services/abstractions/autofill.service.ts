import { CipherView } from 'jslib/models/view';
import { IPageDetail } from 'src/popup/vault/current-tab.component';
import AutofillPageDetails from '../../models/autofillPageDetails';

export interface IAutoFillOptions {
    cipher: CipherView;
    pageDetails: IPageDetail[];
    skipUsernameOnlyFill?: boolean;
    onlyEmptyFields?: boolean;
    onlyVisibleFields?: boolean;
    skipLastUsed?: boolean;
    skipTotp?: boolean;
    doc?: Document;
}

export abstract class AutofillService {
    getFormsWithPasswordFields: (pageDetails: AutofillPageDetails) => any[];
    doAutoFill: (options: IAutoFillOptions) => Promise<string>;
    doAutoFillForLastUsedLogin: (pageDetails: IPageDetail[], fromCommand: boolean) => Promise<string>;
}

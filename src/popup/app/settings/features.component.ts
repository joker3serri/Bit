import * as angular from 'angular';
import { UtilsService } from '../../../services/abstractions/utils.service';
import StateService from '../services/state.service';
import * as template from './features.component.html';

class FeaturesController {
    disableFavicon = false;
    enableAutoFillOnPageLoad = false;
    disableAutoTotpCopy = false;
    disableContextMenuItem = false;
    disableAddLoginNotification = false;
    disableGa = false;
    i18n: any;

    constructor(private i18nService: any, private $analytics: any, private constantsService: any,
                private utilsService: UtilsService, private totpService: any, private stateService: StateService,
                private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;

        $timeout(() => {
            utilsService.initListSectionItemListeners(document, angular);
        }, 500);

        chrome.storage.local.get(constantsService.enableAutoFillOnPageLoadKey, (obj: any) => {
            $timeout(() => {
                this.enableAutoFillOnPageLoad = obj && obj[constantsService.enableAutoFillOnPageLoadKey] === true;
            });
        });

        chrome.storage.local.get(constantsService.disableGaKey, (obj: any) => {
            $timeout(() => {
                // Default for Firefox is disabled.
                if ((utilsService.isFirefox() && obj[constantsService.disableGaKey] === undefined) ||
                    obj[constantsService.disableGaKey]) {
                    this.disableGa = true;
                } else {
                    this.disableGa = false;
                }
            });
        });

        chrome.storage.local.get(constantsService.disableAddLoginNotificationKey, (obj: any) => {
            $timeout(() => {
                if (obj && obj[constantsService.disableAddLoginNotificationKey]) {
                    this.disableAddLoginNotification = true;
                } else {
                    this.disableAddLoginNotification = false;
                }
            });
        });

        chrome.storage.local.get(constantsService.disableContextMenuItemKey, (obj: any) => {
            $timeout(() => {
                if (obj && obj[constantsService.disableContextMenuItemKey]) {
                    this.disableContextMenuItem = true;
                } else {
                    this.disableContextMenuItem = false;
                }
            });
        });

        totpService
            .isAutoCopyEnabled()
            .then((enabled: boolean) => {
                $timeout(() => {
                    this.disableAutoTotpCopy = !enabled;
                });
            });

        chrome.storage.local.get(constantsService.disableFaviconKey, (obj: any) => {
            $timeout(() => {
                this.disableFavicon = obj && obj[constantsService.disableFaviconKey] === true;
            });
        });

    }

    updateGa() {
        chrome.storage.local.get(this.constantsService.disableGaKey, (obj: any) => {
            // Default for Firefox is disabled.
            if ((this.utilsService.isFirefox() && obj[this.constantsService.disableGaKey] === undefined) ||
                obj[this.constantsService.disableGaKey]) {
                // enable
                obj[this.constantsService.disableGaKey] = false;
            } else {
                // disable
                this.$analytics.eventTrack('Disabled Analytics');
                obj[this.constantsService.disableGaKey] = true;
            }

            chrome.storage.local.set(obj, () => {
                this.$timeout(() => {
                    this.disableGa = obj[this.constantsService.disableGaKey];
                });
                if (!obj[this.constantsService.disableGaKey]) {
                    this.$analytics.eventTrack('Enabled Analytics');
                }
            });
        });
    }

    updateAddLoginNotification() {
        chrome.storage.local.get(this.constantsService.disableAddLoginNotificationKey, (obj: any) => {
            if (obj[this.constantsService.disableAddLoginNotificationKey]) {
                // enable
                obj[this.constantsService.disableAddLoginNotificationKey] = false;
            } else {
                // disable
                this.$analytics.eventTrack('Disabled Add Login Notification');
                obj[this.constantsService.disableAddLoginNotificationKey] = true;
            }

            chrome.storage.local.set(obj, () => {
                this.$timeout(() => {
                    this.disableAddLoginNotification = obj[this.constantsService.disableAddLoginNotificationKey];
                });
                if (!obj[this.constantsService.disableAddLoginNotificationKey]) {
                    this.$analytics.eventTrack('Enabled Add Login Notification');
                }
            });
        });
    }

    updateDisableContextMenuItem() {
        chrome.storage.local.get(this.constantsService.disableContextMenuItemKey, (obj: any) => {
            if (obj[this.constantsService.disableContextMenuItemKey]) {
                // enable
                obj[this.constantsService.disableContextMenuItemKey] = false;
            } else {
                // disable
                this.$analytics.eventTrack('Disabled Context Menu Item');
                obj[this.constantsService.disableContextMenuItemKey] = true;
            }

            chrome.storage.local.set(obj, () => {
                this.$timeout(() => {
                    this.disableContextMenuItem = obj[this.constantsService.disableContextMenuItemKey];
                });
                if (!obj[this.constantsService.disableContextMenuItemKey]) {
                    this.$analytics.eventTrack('Enabled Context Menu Item');
                }
                chrome.runtime.sendMessage({
                    command: 'bgUpdateContextMenu',
                });
            });
        });
    }

    updateAutoTotpCopy() {
        chrome.storage.local.get(this.constantsService.disableAutoTotpCopyKey, (obj: any) => {
            if (obj[this.constantsService.disableAutoTotpCopyKey]) {
                // enable
                obj[this.constantsService.disableAutoTotpCopyKey] = false;
            } else {
                // disable
                this.$analytics.eventTrack('Disabled Auto Copy TOTP');
                obj[this.constantsService.disableAutoTotpCopyKey] = true;
            }

            chrome.storage.local.set(obj, () => {
                this.$timeout(() => {
                    this.disableAutoTotpCopy = obj[this.constantsService.disableAutoTotpCopyKey];
                });
                if (!obj[this.constantsService.disableAutoTotpCopyKey]) {
                    this.$analytics.eventTrack('Enabled Auto Copy TOTP');
                }
            });
        });
    }

    updateAutoFillOnPageLoad() {
        chrome.storage.local.get(this.constantsService.enableAutoFillOnPageLoadKey, (obj: any) => {
            if (obj[this.constantsService.enableAutoFillOnPageLoadKey]) {
                // disable
                obj[this.constantsService.enableAutoFillOnPageLoadKey] = false;
            } else {
                // enable
                this.$analytics.eventTrack('Enable Auto-fill Page Load');
                obj[this.constantsService.enableAutoFillOnPageLoadKey] = true;
            }

            chrome.storage.local.set(obj, () => {
                this.$timeout(() => {
                    this.enableAutoFillOnPageLoad = obj[this.constantsService.enableAutoFillOnPageLoadKey];
                });
                if (!obj[this.constantsService.enableAutoFillOnPageLoadKey]) {
                    this.$analytics.eventTrack('Disable Auto-fill Page Load');
                }
            });
        });
    }

    updateDisableFavicon() {
        chrome.storage.local.get(this.constantsService.disableFaviconKey, (obj: any) => {
            if (obj[this.constantsService.disableFaviconKey]) {
                // enable
                obj[this.constantsService.disableFaviconKey] = false;
            } else {
                // disable
                this.$analytics.eventTrack('Disabled Favicon');
                obj[this.constantsService.disableFaviconKey] = true;
            }

            chrome.storage.local.set(obj, () => {
                this.$timeout(() => {
                    this.disableFavicon = obj[this.constantsService.disableFaviconKey];
                    this.stateService.saveState('faviconEnabled', !this.disableFavicon);
                });
                if (!obj[this.constantsService.disableFaviconKey]) {
                    this.$analytics.eventTrack('Enabled Favicon');
                }
            });
        });
    }
}

export const FeaturesComponent = {
    bindings: {},
    controller: FeaturesController,
    template,
};

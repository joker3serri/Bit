import UtilsService from '../../../services/utils.service';

export class ToolsController {
    constructor(private $scope: any, private SweetAlert: any, private i18nService: any,
        private $analytics: any, private utilsService: UtilsService) {

        $scope.i18n = i18nService;
        $scope.showExport = !utilsService.isEdge();
        $scope.launchWebVault = (createOrg: any) => {
            $analytics.eventTrack('Launch Web Vault' + (createOrg ? ' For Share' : ''));
            chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/' + (createOrg ? '?org=free' : '') });
        };

        $scope.launchiOS = () => {
            $analytics.eventTrack('Launch iOS');
            chrome.tabs.create({ url: 'https://itunes.apple.com/us/app/bitwarden-free-password-manager/id1137397744?mt=8' });
        };

        $scope.launchAndroid = () => {
            $analytics.eventTrack('Launch Android');
            chrome.tabs.create({ url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden' });
        };

        $scope.launchImport = () => {
            SweetAlert.swal({
                title: i18nService.importItems,
                text: i18nService.importItemsConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed: boolean) {
                if (confirmed) {
                    $analytics.eventTrack('Launch Web Vault For Import');
                    chrome.tabs.create({ url: 'https://help.bitwarden.com/article/import-data/' });
                }
            });
        };
    }
}

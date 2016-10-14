angular
    .module('bit.settings')

    .controller('settingsHelpController', function ($scope, $analytics) {
        $scope.email = function () {
            chrome.tabs.create({ url: 'mailto:hello@bitwarden.com' });
        };

        $scope.website = function () {
            chrome.tabs.create({ url: 'https://bitwarden.com/contact/' });
        };

        $scope.bug = function () {
            chrome.tabs.create({ url: 'https://github.com/bitwarden/browser' });
        };
    });

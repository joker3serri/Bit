angular
    .module('bit.services')

    .factory('faviconService', function ($http, $q, settingsService, utilsService, constantsService) {
        var _service = {};
        _service.favicons = {};

        var defaultIcon = chrome.extension.getURL('images/fa-globe.png');

        var enabled = false;

        chrome.storage.local.get(constantsService.disableFaviconKey, function(obj) {
            enabled = !obj[constantsService.disableFaviconKey];
        });

        function buildUrl (hostname) {
            return "https://icons.bitwarden.com/?url=" + hostname;
        }

        _service.enabled = function () {
            return enabled || (utilsService.getBrowser() === 'chrome');
        };

        _service.getIconUrl = function (uri) {
            var hostname;
            try {
                hostname = new URL(uri).hostname;
            } catch (e) {
                return defaultIcon;
            }

            if (enabled) {
                return buildUrl(hostname);
            } else if (utilsService.getBrowser() === 'chrome') {
                return 'chrome://favicon/' + uri;
            }

            return buildUrl(hostname);
        };

        _service.disable = function (disabled) {
            enabled = !disabled;
        };

        return _service;
    });

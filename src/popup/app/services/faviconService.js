angular
    .module('bit.services')

    .factory('faviconService', function ($http, $q, settingsService, utilsService, constantsService) {
        var _service = {};
        _service.favicons = {};

        // Expire favicons after 30 days.
        var expire = 30 * 24 * 60 * 60 * 1000;

        var faviconKey = 'favicon';

        function buildUrl (domain) {
            // TODO: Replace with url to "icons.bitwarden.com".
            return "https://www.google.com/s2/favicons?domain=" + domain;
        }

        // Load the favicon and encode it using base64.
        function loadFavicon(domain) {
            return $http
                .get(buildUrl(domain), {responseType: 'blob'})
                .then(function (body) {
                    var deferred = $q.defer();

                    var reader = new FileReader();
                    reader.onload = function () {
                        deferred.resolve(reader.result);
                    };
                    reader.readAsDataURL(body.data);

                    return deferred.promise;
                });
        }

        function getStorage() {
            var deferred = $q.defer();
            chrome.storage.local.get(faviconKey, function (data) {

                var d = data[faviconKey];
                if (d == null) {
                    d = {};
                }

                deferred.resolve(d);
            });
            return deferred.promise;
        }

        // Check if the cached favicon is valid.
        function isValid(favicon) {
            return favicon.date > new Date().getTime() - expire;
        }

        function remoteFaviconsEnabled() {
            var deferred = $q.defer();
            chrome.storage.local.get(constantsService.disableFaviconKey, function(obj) {
                deferred.resolve(obj[constantsService.disableFaviconKey]);
            });
            return deferred.promise;
        }

        // Load all the favicons for the specified array of logins.
        _service.loadFavicons = function(logins) {
            logins.forEach(function (item) {
                _service.getFavicon(item.uri).then(function(img) {
                    _service.favicons[item.uri] = img;
                });
            });
        };

        // Return the favicon for a specific uri.
        _service.getFavicon = function (uri) {
            var domain = utilsService.getDomain(uri);

            return getStorage()
                .then(function (favicon) {

                    // Use cached favicon if possible.
                    if (favicon.hasOwnProperty(domain)) {
                        if (isValid(favicon[domain])) {
                            return favicon[domain].img;
                        }
                    }

                    return remoteFaviconsEnabled()
                        .then(function (disableFavicon) {

                            if (disableFavicon) {
                                if (utilsService.getBrowser() === 'chrome') {
                                    return 'chrome://favicon/' + uri;
                                }
                                return;
                            }

                            // Load and cache the remote favicon.
                            return loadFavicon(domain)
                                .then(function(img) {
                                    favicon[domain] = {
                                        img: img,
                                        date: new Date()
                                    };

                                    var storage = {};
                                    storage[faviconKey] = favicon;
                                    chrome.storage.local.set(storage);

                                    return img;
                                });
                    });
                });
        };

        _service.enabled = function() {
            chrome.storage.local.get(constantsService.disableFaviconKey, function(obj) {
                $scope.showFavicon = !obj[constantsService.disableFaviconKey];
            });
        };

        return _service;
    });

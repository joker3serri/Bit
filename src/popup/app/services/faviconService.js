angular
    .module('bit.services')

    .factory('faviconService', function ($http, $q, settingsService, utilsService, constantsService) {
        var _service = {};
        _service.favicons = {};

        // Expire favicons after 30 days.
        var expire = 30 * 24 * 60 * 60 * 1000;
        var faviconKey = 'favicon';
        var defaultIcon = chrome.extension.getURL('images/fa-globe.png');

        _service.enabled = false;

        remoteFaviconsEnabled().then((disabled) => {
            _service.enabled = !disabled || (utilsService.getBrowser() === 'chrome');
        });

        function buildUrl (hostname) {
            return "https://icons.bitwarden.com/?url=" + hostname;
        }

        // Load the favicon and encode it using base64.
        function loadFavicon(hostname) {
            return $http
                .get(buildUrl(hostname), {responseType: 'blob'})
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

        _service.disable = function (disabled) {
            _service.enabled = !disabled || (utilsService.getBrowser() === 'chrome');
        };

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
            var hostname;
            try {
                hostname = new URL(uri).hostname;
            } catch (e) {
                return $q.when(defaultIcon);
            }

            return getStorage()
                .then(function (favicon) {

                    // Use cached favicon if possible.
                    if (favicon.hasOwnProperty(hostname)) {
                        if (isValid(favicon[hostname])) {
                            return favicon[hostname].img;
                        }
                    }

                    return remoteFaviconsEnabled()
                        .then(function (disableFavicon) {

                            if (disableFavicon) {
                                // Display the cached favicon.
                                if (utilsService.getBrowser() === 'chrome') {
                                    return 'chrome://favicon/' + uri;
                                }
                                return;
                            }

                            // Load and cache the remote favicon.
                            return loadFavicon(hostname)
                                .then(function(img) {
                                    favicon[hostname] = {
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

        return _service;
    });

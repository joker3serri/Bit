angular
    .module('bit.services')

    .factory('faviconService', function ($http, $q, settingsService, utilsService, constantsService) {
        var _service = {};

        // Expire favicons after 30 days.
        var expire = 30 * 24 * 60 * 60 * 1000;

        _service.buildUrl = function (domain) {
            // TODO: Replace with url to "icons.bitwarden.com".
            return "https://www.google.com/s2/favicons?domain=" + domain;
        };

        _service.favicons = {};

        _service.loadFavicons = function(logins) {
            logins.forEach((item) => {
                _service.getFavicon(item.uri).then((img) => {
                    _service.favicons[item.uri] = img;
                });
            });
        };

        _service.getFavicon = function (uri) {
            var domain = utilsService.getDomain(uri);
            var faviconKey = 'favicon';

            var deferred = $q.defer();
            chrome.storage.local.get(faviconKey, function (data) {
                deferred.resolve(data);
            });

            return deferred.promise
                .then(function (storage) {
                    var favicon = storage[faviconKey];
                    if (favicon == null) {
                        favicon = {};
                    }

                    if (favicon.hasOwnProperty(domain)) {
                        if (favicon[domain].date > new Date().getTime() - expire) {
                            return favicon[domain].img;
                        }
                    }

                    var deferred = $q.defer();
                    chrome.storage.local.get(constantsService.disableFaviconKey, function(obj) {
                        deferred.resolve(obj);
                    });
                    return deferred.promise.then((showFavicon) => {
                        if (showFavicon.disableFavicon) {
                            if (utilsService.getBrowser() === 'chrome') {
                                return 'chrome://favicon/' + uri;
                            }
                            return;
                        }

                        return $http
                            .get(_service.buildUrl(domain), {responseType: 'blob'})
                            .then(function (body) {
                                var deferred = $q.defer();

                                var reader = new FileReader();
                                reader.onload = function () {
                                    deferred.resolve(reader.result);
                                }
                                reader.readAsDataURL(body.data);

                                return deferred.promise;
                            })
                            .then(function(img) {
                                favicon[domain] = {
                                    img: img,
                                    date: new Date()
                                };

                                storage[faviconKey] = favicon;
                                chrome.storage.local.set(storage);

                                return img;
                            });
                    })
                });
        };

        _service.enabled = function() {
            chrome.storage.local.get(constantsService.disableFaviconKey, function(obj) {
                $scope.showFavicon = !obj[constantsService.disableFaviconKey];
            });
        };

        return _service;
    });

angular
    .module('bit.services')

    .factory('historyService', function ($q, constantsService, cryptoService) {
        console.log(cryptoService);
        var _service = {};
        var _history = [];
        var key = constantsService.generatedPasswordHistory;

        var MAX_PASSWORDS_IN_HISTORY = 10;

        chrome.storage.local.get(key, function(obj) {
            var encrypted = obj[key];

            decrypt(encrypted)
                .then(function(history) {
                    history.forEach(function(item) {
                        _history.push(item);
                    });
                });
        });

        _service.get = function () {
            return _history;
        };

        _service.add = function (password) {
            if (matchesPrevious(password)) {
                return;
            }

            _history.push({
                password: password,
                date: Date.now()
            });

            // Remove old items.
            if (_history.length > MAX_PASSWORDS_IN_HISTORY) {
                _history.pop();
            }

            save();
        };

        function save() {
            return encryptHistory()
                .then(function(history) {
                    console.log(history);
                    var obj = {};
                    obj[key] = history;
                    chrome.storage.local.set(obj);
                });
        }

        function encryptHistory() {
            var promises = _history.map(function(historyItem) {
                return cryptoService.encrypt(historyItem.password).then(function(encrypted) {
                    return {
                        password: encrypted.encryptedString,
                        date: historyItem.date
                    };
                });
            });

            return $q.all(promises);
        }

        function decrypt(history) {
            var promises = history.map(function(item) {
                return cryptoService.decrypt(new CipherString(item.password)).then(function(decrypted) {
                    return {
                        password: decrypted,
                        date: item.date
                    };
                });
            });

            return $q.all(promises);
        }

        function matchesPrevious(password) {
            var len = _history.length;

            return len !== 0 && _history[len-1].password === password;
        }

        return _service;
    });

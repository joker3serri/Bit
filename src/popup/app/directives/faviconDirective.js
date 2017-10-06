angular
    .module('bit.directives')

    .directive('favicon', function (faviconService) {
        return {
            restrict: 'A',
            scope: {
                uri: '<'
            },
            link: function (scope, element, attrs) {
                faviconService
                    .getFavicon(scope.uri)
                    .then(function(img) {
                        attrs.$set('src', img);
                    });
            }
        };
    });

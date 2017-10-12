angular
    .module('bit.components')
    .component('favicon', {
    	bindings: {
    		uri: '<'
    	},
        template: '<div class="favicon" ng-if="$ctrl.enabled()"><img src="{{$ctrl.url}}"></div>',
        controller: function(stateService) {
            this.$onInit = (function() {
        		this.enabled = function() {
                    return stateService.getState('faviconEnabled');
                };

                var hostname;
                try {
                    console.log(this);
                    hostname = new URL(this.uri).hostname;
                    this.url = 'https://icons.bitwarden.com/' + hostname + '/icon.png';
                } catch (e) {
                    // Invalid URL.
                    this.url = chrome.extension.getURL('images/fa-globe.png');
                }
            }).bind(this);
        }
    });
